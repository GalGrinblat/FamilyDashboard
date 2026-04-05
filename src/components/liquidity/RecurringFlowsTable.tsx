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
import {
  Plus,
  Link,
  Trash2,
  Archive,
  ArchiveRestore,
  ArrowRightLeft,
  CheckCheck,
} from 'lucide-react';
import { Database } from '@/types/database.types';
import {
  CATEGORY_TYPES,
  CATEGORY_DOMAIN_SHORT_LABELS,
  CategoryDomain,
  FREQUENCY_TYPES,
} from '@/lib/constants';
import { RecurringFlowDialog } from './RecurringFlowDialog';
import { ChangePaymentMethodDialog } from './ChangePaymentMethodDialog';
import { formatCurrency, getAmountColorClass } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { completePaymentMethodChange } from '@/app/(app)/liquidity/actions';

type FlowRow = Database['public']['Tables']['recurring_flows']['Row'] & {
  accounts?: { name: string } | null;
  categories?: { domain: string | null } | null;
};

type PendingChange = {
  id: string;
  recurring_flow_id: string | null;
  target_account_id: string | null;
  title: string;
};

function isExpired(flow: FlowRow): boolean {
  if (!flow.end_date) return false;
  return new Date(flow.end_date) < new Date(new Date().toDateString());
}

function isRetired(flow: FlowRow): boolean {
  return flow.is_active === false;
}

interface FlowTableProps {
  flows: FlowRow[];
  accounts: { id: string; name: string }[];
  colorClass: string;
  onDelete: (flow: FlowRow) => void;
  onToggleRetire: (flow: FlowRow) => void;
  pendingChanges: PendingChange[];
  onMarkChangeDone: (pending: PendingChange) => void;
}

function FlowTable({
  flows,
  accounts,
  colorClass,
  onDelete,
  onToggleRetire,
  pendingChanges,
  onMarkChangeDone,
}: FlowTableProps) {
  if (flows.length === 0) {
    return <p className="text-lg text-muted-foreground italic px-2 py-3">אין רשומות.</p>;
  }

  const renderStatusBadge = (flow: FlowRow) => {
    if (isRetired(flow)) {
      return (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-lg font-medium ring-1 ring-inset bg-zinc-100 text-zinc-500 ring-zinc-300/80 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-600/30">
          פרוש
        </span>
      );
    }
    if (isExpired(flow)) {
      return (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-lg font-medium ring-1 ring-inset bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/20">
          פג תוקף
        </span>
      );
    }
    return null;
  };

  const renderActions = (flow: FlowRow) => {
    const linked = !!(flow.property_id || flow.vehicle_id || flow.policy_id);
    const pendingChange = pendingChanges.find((r) => r.recurring_flow_id === flow.id);
    return (
      <div className="flex items-center gap-0.5 flex-wrap">
        {pendingChange && (
          <Button variant="outline" size="sm" onClick={() => onMarkChangeDone(pendingChange)}>
            <CheckCheck className="h-4 w-4 ml-1" />
            סמן כבוצע
          </Button>
        )}
        {!linked && (
          <>
            <ChangePaymentMethodDialog flow={flow} accounts={accounts} />
            <RecurringFlowDialog flowToEdit={flow} accounts={accounts} />
            <Button
              variant="ghost"
              size="icon"
              title={isRetired(flow) ? 'שחזר תזרים' : 'פרוש תזרים'}
              onClick={() => onToggleRetire(flow)}
              className={
                isRetired(flow)
                  ? 'text-emerald-600 hover:text-emerald-700'
                  : 'text-amber-500 hover:text-amber-600'
              }
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
              onClick={() => onDelete(flow)}
              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
        {linked && <RecurringFlowDialog flowToEdit={flow} accounts={accounts} />}
      </div>
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-zinc-50/80 dark:bg-zinc-900/40">
          <TableHead className="text-right w-[220px]">שם התזרים</TableHead>
          <TableHead className="text-right w-[130px]">אמצעי תשלום</TableHead>
          <TableHead className="text-right w-[80px]">תדירות</TableHead>
          <TableHead className="text-right w-[80px]">ענף</TableHead>
          <TableHead className="text-right w-[110px]">מתאריך</TableHead>
          <TableHead className="text-right w-[110px]">עד תאריך</TableHead>
          <TableHead className={`text-left w-[120px] ${colorClass}`}>סכום צפוי</TableHead>
          <TableHead className="w-[150px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flows.map((flow) => {
          const inactive = isRetired(flow) || isExpired(flow);
          const expired = isExpired(flow);
          const pendingChange = pendingChanges.find((r) => r.recurring_flow_id === flow.id);
          return (
            <TableRow
              key={flow.id}
              className={inactive ? 'opacity-50 bg-zinc-50/50 dark:bg-zinc-900/20' : ''}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={inactive ? 'line-through text-zinc-400' : ''}>{flow.name}</span>
                  {(flow.property_id || flow.vehicle_id || flow.policy_id) && (
                    <span title="תזרים מנוהל אוטומטית">
                      <Link className="h-3 w-3 text-zinc-400" />
                    </span>
                  )}
                  {renderStatusBadge(flow)}
                  {pendingChange && (
                    <span className="inline-flex items-center gap-1 text-base bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-md">
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      ממתין להחלפת חשבון
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-zinc-500 text-lg">{flow.accounts?.name || '-'}</TableCell>
              <TableCell className="text-lg">
                {flow.frequency === FREQUENCY_TYPES.MONTHLY
                  ? 'חודשי'
                  : flow.frequency === FREQUENCY_TYPES.YEARLY
                    ? 'שנתי'
                    : 'שבועי'}
              </TableCell>
              <TableCell className="text-zinc-500 text-lg">
                {flow.domain || flow.categories?.domain
                  ? CATEGORY_DOMAIN_SHORT_LABELS[
                      (flow.domain || flow.categories?.domain) as CategoryDomain
                    ] || 'כללי'
                  : 'כללי'}
              </TableCell>
              <TableCell className="text-zinc-500 text-lg">
                {flow.start_date ? new Date(flow.start_date).toLocaleDateString('he-IL') : '-'}
              </TableCell>
              <TableCell
                className={`text-lg ${expired ? 'text-amber-600 font-medium' : 'text-zinc-500'}`}
              >
                {flow.end_date ? new Date(flow.end_date).toLocaleDateString('he-IL') : '-'}
              </TableCell>
              <TableCell
                className={`font-semibold text-left ${inactive ? 'text-zinc-400' : colorClass}`}
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
  );
}

// ── Mobile card (shared) ─────────────────────────────────────────────────────
interface MobileCardProps {
  flow: FlowRow;
  accounts: { id: string; name: string }[];
  onDelete: (flow: FlowRow) => void;
  onToggleRetire: (flow: FlowRow) => void;
  pendingChanges: PendingChange[];
  onMarkChangeDone: (pending: PendingChange) => void;
}

function MobileCard({
  flow,
  accounts,
  onDelete,
  onToggleRetire,
  pendingChanges,
  onMarkChangeDone,
}: MobileCardProps) {
  const inactive = isRetired(flow) || isExpired(flow);
  const expired = isExpired(flow);
  const linked = !!(flow.property_id || flow.vehicle_id || flow.policy_id);
  const pendingChange = pendingChanges.find((r) => r.recurring_flow_id === flow.id);

  const statusBadge = isRetired(flow) ? (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-lg font-medium ring-1 ring-inset bg-zinc-100 text-zinc-500 ring-zinc-300/80 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-600/30">
      פרוש
    </span>
  ) : expired ? (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-lg font-medium ring-1 ring-inset bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/20">
      פג תוקף
    </span>
  ) : null;

  return (
    <div
      className={`flex flex-col space-y-3 p-4 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 relative ${inactive ? 'opacity-60' : ''}`}
    >
      <div className="absolute top-2 left-2 flex items-center gap-1 flex-wrap">
        {pendingChange && (
          <Button variant="outline" size="sm" onClick={() => onMarkChangeDone(pendingChange)}>
            <CheckCheck className="h-4 w-4 ml-1" />
            סמן כבוצע
          </Button>
        )}
        {!linked && (
          <>
            <ChangePaymentMethodDialog flow={flow} accounts={accounts} />
            <RecurringFlowDialog flowToEdit={flow} accounts={accounts} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleRetire(flow)}
              className={
                isRetired(flow)
                  ? 'text-emerald-600 hover:text-emerald-700'
                  : 'text-amber-500 hover:text-amber-600'
              }
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
              onClick={() => onDelete(flow)}
              className="text-rose-500 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
        {linked && <RecurringFlowDialog flowToEdit={flow} accounts={accounts} />}
      </div>

      <div className="flex flex-col pt-2">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          {statusBadge}
          {pendingChange && (
            <span className="inline-flex items-center gap-1 text-base bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-md">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              ממתין להחלפת חשבון
            </span>
          )}
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

      <div className="flex flex-wrap items-center gap-2 text-base text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-lg">
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
          {flow.domain || flow.categories?.domain
            ? CATEGORY_DOMAIN_SHORT_LABELS[
                (flow.domain || flow.categories?.domain) as CategoryDomain
              ] || 'כללי'
            : 'כללי'}
        </span>
      </div>

      {(flow.start_date || flow.end_date) && (
        <div className="flex gap-4 text-base text-zinc-500 dark:text-zinc-400 px-1">
          <span>
            מתאריך:{' '}
            {flow.start_date ? new Date(flow.start_date).toLocaleDateString('he-IL') : 'תמיד'}
          </span>
          <span className={expired ? 'text-amber-600 font-medium' : ''}>
            עד תאריך: {flow.end_date ? new Date(flow.end_date).toLocaleDateString('he-IL') : 'תמיד'}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  label,
  total,
  type,
}: {
  label: string;
  total: number;
  type: 'income' | 'expense';
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-2 rounded-t-lg border-b text-lg font-semibold ${
        type === 'income'
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300'
          : 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/40 text-rose-700 dark:text-rose-300'
      }`}
    >
      <span>{label}</span>
      <span dir="ltr" className="font-bold">
        {formatCurrency(type === 'expense' ? -total : total, true)}
      </span>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export function RecurringFlowsTable({
  flows,
  accounts,
  pendingChanges = [],
}: {
  flows: FlowRow[];
  accounts: { id: string; name: string }[];
  pendingChanges?: PendingChange[];
}) {
  const supabase = createClient();
  const router = useRouter();

  const handleDelete = async (flow: FlowRow) => {
    if (!window.confirm(`האם למחוק את "${flow.name}" לצמיתות? לא ניתן לשחזר.`)) return;
    const { error } = await supabase.from('recurring_flows').delete().eq('id', flow.id);
    if (error) {
      alert('שגיאה במחיקה');
    } else {
      router.refresh();
    }
  };

  const handleMarkChangeDone = async (pending: PendingChange) => {
    if (!pending.recurring_flow_id || !pending.target_account_id) return;
    await completePaymentMethodChange(
      pending.id,
      pending.recurring_flow_id,
      pending.target_account_id,
    );
    router.refresh();
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
      alert('שגיאה בפעולה');
    } else {
      router.refresh();
    }
  };

  // Split and sort: active first, then retired/expired
  const sortByActivity = (a: FlowRow, b: FlowRow) => {
    const ai = isRetired(a) || isExpired(a);
    const bi = isRetired(b) || isExpired(b);
    return ai === bi ? 0 : ai ? 1 : -1;
  };

  const incomeFlows = flows.filter((f) => f.type === CATEGORY_TYPES.INCOME).sort(sortByActivity);
  const expenseFlows = flows.filter((f) => f.type === CATEGORY_TYPES.EXPENSE).sort(sortByActivity);

  if (flows.length === 0) {
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

  // ── Totals ───────────────────────────────────────────────────────────────
  const activeIncome = incomeFlows
    .filter((f) => !isRetired(f) && !isExpired(f))
    .reduce((s, f) => s + f.amount, 0);
  const activeExpense = expenseFlows
    .filter((f) => !isRetired(f) && !isExpired(f))
    .reduce((s, f) => s + f.amount, 0);
  const netFlow = activeIncome - activeExpense;

  return (
    <div className="w-full space-y-8">
      {/* ── Income ── */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <SectionHeader label="הכנסות קבועות" total={activeIncome} type="income" />
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <FlowTable
            flows={incomeFlows}
            accounts={accounts}
            colorClass={getAmountColorClass('income')}
            onDelete={handleDelete}
            onToggleRetire={handleToggleRetire}
            pendingChanges={pendingChanges}
            onMarkChangeDone={handleMarkChangeDone}
          />
        </div>
        {/* Mobile */}
        <div className="md:hidden flex flex-col gap-3 p-4">
          {incomeFlows.map((flow) => (
            <MobileCard
              key={flow.id}
              flow={flow}
              accounts={accounts}
              onDelete={handleDelete}
              onToggleRetire={handleToggleRetire}
              pendingChanges={pendingChanges}
              onMarkChangeDone={handleMarkChangeDone}
            />
          ))}
        </div>
      </div>

      {/* ── Expenses ── */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <SectionHeader label="הוצאות קבועות" total={activeExpense} type="expense" />
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <FlowTable
            flows={expenseFlows}
            accounts={accounts}
            colorClass={getAmountColorClass('expense')}
            onDelete={handleDelete}
            onToggleRetire={handleToggleRetire}
            pendingChanges={pendingChanges}
            onMarkChangeDone={handleMarkChangeDone}
          />
        </div>
        {/* Mobile */}
        <div className="md:hidden flex flex-col gap-3 p-4">
          {expenseFlows.map((flow) => (
            <MobileCard
              key={flow.id}
              flow={flow}
              accounts={accounts}
              onDelete={handleDelete}
              onToggleRetire={handleToggleRetire}
              pendingChanges={pendingChanges}
              onMarkChangeDone={handleMarkChangeDone}
            />
          ))}
        </div>
      </div>

      {/* ── Net Flow Summary ── */}
      <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
        <span className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
          תזרים נטו חודשי
        </span>
        <span
          dir="ltr"
          className={`text-base font-bold ${netFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
        >
          {formatCurrency(netFlow, true)}
        </span>
      </div>
    </div>
  );
}
