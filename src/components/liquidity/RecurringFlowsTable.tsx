'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Link, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import { Database } from '@/types/database.types';
import {
  CATEGORY_TYPES,
  CATEGORY_DOMAIN_SHORT_LABELS,
  CategoryDomain,
  FREQUENCY_TYPES,
} from '@/lib/constants';
import { RecurringFlowDialog } from './RecurringFlowDialog';
import { ChangePaymentMethodDialog } from './ChangePaymentMethodDialog';
import { formatCurrency, getAmountColorClass, getBadgeColorClass } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type FlowRow = Database['public']['Tables']['recurring_flows']['Row'] & {
  accounts?: { name: string } | null;
};

function isExpired(flow: FlowRow): boolean {
  if (!flow.end_date) return false;
  return new Date(flow.end_date) < new Date(new Date().toDateString());
}

function isRetired(flow: FlowRow): boolean {
  return flow.is_active === false;
}

export function RecurringFlowsTable({
  flows,
  accounts,
}: {
  flows: FlowRow[];
  accounts: { id: string; name: string }[];
}) {
  const supabase = createClient();
  const router = useRouter();

  const handleDelete = async (flow: FlowRow) => {
    if (!window.confirm(`האם למחוק את "${flow.name}" לצמיתות? לא ניתן לשחזר.`)) return;
    const { error } = await supabase.from('recurring_flows').delete().eq('id', flow.id);
    if (error) {
      console.error(error);
      alert('שגיאה במחיקה');
    } else {
      router.refresh();
    }
  };

  const handleToggleRetire = async (flow: FlowRow) => {
    const retiring = !isRetired(flow);
    const label = retiring ? 'לפרוש' : 'לשחזר';
    if (!window.confirm(`האם ${label} את "${flow.name}"?`)) return;
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('recurring_flows')
      .update({ is_active: !retiring, end_date: retiring ? today : null })
      .eq('id', flow.id);
    if (error) {
      console.error(error);
      alert('שגיאה בפעולה');
    } else {
      router.refresh();
    }
  };

  // Sort: active income first, active expense, then retired flows
  const sortedFlows = [...flows].sort((a, b) => {
    const aRetired = isRetired(a) || isExpired(a);
    const bRetired = isRetired(b) || isExpired(b);
    if (aRetired !== bRetired) return aRetired ? 1 : -1;
    if (a.type !== b.type) return a.type === CATEGORY_TYPES.INCOME ? -1 : 1;
    return 0;
  });

  if (!sortedFlows || sortedFlows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
        <p>לא הוגדרו תזרימים קבועים במערכת (משכורות, הוצאות ליבה).</p>
        <RecurringFlowDialog
          triggerButton={
            <Button variant="outline" className="mt-4">
              <Plus className="ml-2 h-4 w-4" />
              הוסף תזרים קבוע
            </Button>
          }
          accounts={accounts}
        />
      </div>
    );
  }

  const renderStatusBadge = (flow: FlowRow) => {
    if (isRetired(flow)) {
      return (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset bg-zinc-100 text-zinc-500 ring-zinc-300/80 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-600/30 mr-1">
          פרוש
        </span>
      );
    }
    if (isExpired(flow)) {
      return (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/20 mr-1">
          פג תוקף
        </span>
      );
    }
    return null;
  };

  const renderActions = (flow: FlowRow) => (
    <div className="flex items-center gap-1">
      {!flow.asset_id && !flow.policy_id && (
        <>
          <ChangePaymentMethodDialog flow={flow} accounts={accounts} />
          <RecurringFlowDialog flowToEdit={flow} accounts={accounts} />
          <Button
            variant="ghost"
            size="icon"
            title={isRetired(flow) ? 'שחזר תזרים' : 'פרוש תזרים'}
            onClick={() => handleToggleRetire(flow)}
            className={isRetired(flow) ? 'text-emerald-600 hover:text-emerald-700' : 'text-amber-500 hover:text-amber-600'}
          >
            {isRetired(flow) ? (
              <ArchiveRestore className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="מחק תזרים"
            onClick={() => handleDelete(flow)}
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
      {(flow.asset_id || flow.policy_id) && (
        <RecurringFlowDialog flowToEdit={flow} accounts={accounts} />
      )}
    </div>
  );

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block">
        <Table className="border-t border-zinc-100 dark:border-zinc-800">
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">סוג</TableHead>
              <TableHead className="text-right">שם התזרים</TableHead>
              <TableHead className="text-right">אמצעי תשלום</TableHead>
              <TableHead className="text-right">תדירות</TableHead>
              <TableHead className="text-right">שיוך ענפי</TableHead>
              <TableHead className="text-right">מתאריך</TableHead>
              <TableHead className="text-right">עד תאריך</TableHead>
              <TableHead className="text-right">סכום צפוי</TableHead>
              <TableHead className="w-[140px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedFlows.map((flow) => {
              const retired = isRetired(flow);
              const expired = isExpired(flow);
              const inactive = retired || expired;
              return (
                <TableRow
                  key={flow.id}
                  className={inactive ? 'opacity-50 bg-zinc-50/50 dark:bg-zinc-900/20' : ''}
                >
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getBadgeColorClass(flow.type)}`}
                      >
                        {flow.type === 'income' ? 'הכנסה' : 'הוצאה'}
                      </span>
                      {renderStatusBadge(flow)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1">
                      <span className={inactive ? 'line-through text-zinc-400' : ''}>
                        {flow.name}
                      </span>
                      {(flow.asset_id || flow.policy_id) && (
                        <span title="תזרים מנוהל אוטומטית">
                          <Link className="h-3 w-3 text-zinc-400" />
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500">{flow.accounts?.name || '-'}</TableCell>
                  <TableCell>
                    {flow.frequency === FREQUENCY_TYPES.MONTHLY
                      ? 'חודשי'
                      : flow.frequency === FREQUENCY_TYPES.YEARLY
                        ? 'שנתי'
                        : 'שבועי'}
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    {flow.domain
                      ? CATEGORY_DOMAIN_SHORT_LABELS[flow.domain as CategoryDomain] || 'כללי'
                      : 'כללי'}
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    {flow.start_date ? new Date(flow.start_date).toLocaleDateString('he-IL') : '-'}
                  </TableCell>
                  <TableCell className={expired ? 'text-amber-600 font-medium' : 'text-zinc-500'}>
                    {flow.end_date ? new Date(flow.end_date).toLocaleDateString('he-IL') : '-'}
                  </TableCell>
                  <TableCell
                    className={`font-semibold text-left ${inactive ? 'text-zinc-400' : getAmountColorClass(flow.type)}`}
                    dir="ltr"
                  >
                    {formatCurrency(
                      flow.type === CATEGORY_TYPES.EXPENSE ? -flow.amount : flow.amount,
                      true,
                    )}
                  </TableCell>
                  <TableCell>{renderActions(flow)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col space-y-3 p-4 pt-2">
        {sortedFlows.map((flow) => {
          const retired = isRetired(flow);
          const expired = isExpired(flow);
          const inactive = retired || expired;
          return (
            <div
              key={flow.id}
              className={`flex flex-col space-y-3 p-4 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 relative ${inactive ? 'opacity-60' : ''}`}
            >
              <div className="absolute top-2 left-2 flex items-center gap-1">
                {renderActions(flow)}
              </div>

              <div className="flex flex-col pt-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`inline-flex self-start items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${getBadgeColorClass(flow.type)}`}
                  >
                    {flow.type === CATEGORY_TYPES.INCOME ? 'הכנסה' : 'הוצאה'}
                  </span>
                  {renderStatusBadge(flow)}
                </div>
                <div className="flex justify-between items-start">
                  <span
                    className={`font-semibold text-zinc-900 dark:text-zinc-100 text-lg ${inactive ? 'line-through text-zinc-400' : ''}`}
                  >
                    {flow.name}
                  </span>
                  <span
                    className={`font-semibold ${inactive ? 'text-zinc-400' : getAmountColorClass(flow.type)}`}
                    dir="ltr"
                  >
                    {formatCurrency(
                      flow.type === CATEGORY_TYPES.EXPENSE ? -flow.amount : flow.amount,
                      true,
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-lg">
                {flow.accounts?.name && (
                  <span className="bg-zinc-200/50 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-800 dark:text-zinc-300 font-medium">
                    {flow.accounts.name}
                  </span>
                )}
                <span>
                  {flow.frequency === FREQUENCY_TYPES.MONTHLY
                    ? 'חודשי'
                    : flow.frequency === FREQUENCY_TYPES.YEARLY
                      ? 'שנתי'
                      : 'שבועי'}
                </span>
                <span className="text-zinc-300 dark:text-zinc-600">•</span>
                <span>
                  {flow.domain
                    ? CATEGORY_DOMAIN_SHORT_LABELS[flow.domain as CategoryDomain] || 'כללי'
                    : 'כללי'}
                </span>
              </div>

              {(flow.start_date || flow.end_date) && (
                <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400 px-1">
                  <span>
                    מתאריך:{' '}
                    {flow.start_date ? new Date(flow.start_date).toLocaleDateString('he-IL') : 'תמיד'}
                  </span>
                  <span className={expired ? 'text-amber-600 font-medium' : ''}>
                    עד תאריך:{' '}
                    {flow.end_date ? new Date(flow.end_date).toLocaleDateString('he-IL') : 'תמיד'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
