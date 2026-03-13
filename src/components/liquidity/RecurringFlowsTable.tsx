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
import { Plus, Link } from 'lucide-react';
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

type FlowRow = Database['public']['Tables']['recurring_flows']['Row'] & {
  accounts?: { name: string } | null;
};

export function RecurringFlowsTable({
  flows,
  accounts,
}: {
  flows: FlowRow[];
  accounts: { id: string; name: string }[];
}) {
  const sortedFlows = [...flows].sort((a, b) => {
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
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedFlows.map((flow) => (
              <TableRow key={flow.id}>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getBadgeColorClass(flow.type)}`}
                  >
                    {flow.type === 'income' ? 'הכנסה' : 'הוצאה'}
                  </span>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1">
                    {flow.name}
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
                <TableCell className="text-zinc-500">
                  {flow.end_date ? new Date(flow.end_date).toLocaleDateString('he-IL') : '-'}
                </TableCell>
                <TableCell
                  className={`font-semibold text-left ${getAmountColorClass(flow.type)}`}
                  dir="ltr"
                >
                  {formatCurrency(
                    flow.type === CATEGORY_TYPES.EXPENSE ? -flow.amount : flow.amount,
                    true,
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ChangePaymentMethodDialog flow={flow} accounts={accounts} />
                    <RecurringFlowDialog flowToEdit={flow} accounts={accounts} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col space-y-3 p-4 pt-2">
        {sortedFlows.map((flow) => (
          <div
            key={flow.id}
            className="flex flex-col space-y-3 p-4 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 relative"
          >
            <div className="absolute top-2 left-2 flex items-center gap-2">
              <ChangePaymentMethodDialog flow={flow} accounts={accounts} />
              <RecurringFlowDialog flowToEdit={flow} accounts={accounts} />
            </div>

            <div className="flex flex-col pt-2">
              <span
                className={`inline-flex self-start items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset mb-1 ${getBadgeColorClass(flow.type)}`}
              >
                {flow.type === CATEGORY_TYPES.INCOME ? 'הכנסה' : 'הוצאה'}
              </span>
              <div className="flex justify-between items-start">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">
                  {flow.name}
                </span>
                <span className={`font-semibold ${getAmountColorClass(flow.type)}`} dir="ltr">
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
                <span>
                  עד תאריך:{' '}
                  {flow.end_date ? new Date(flow.end_date).toLocaleDateString('he-IL') : 'תמיד'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
