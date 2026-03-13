import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Database } from '@/types/database.types';
import { CATEGORY_TYPES } from '@/lib/constants';
import { formatCurrency, getAmountColorClass } from '@/lib/utils';

type TransactionRow = Database['public']['Tables']['transactions']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

export type TransactionWithCategory = TransactionRow & {
  categories?: Partial<CategoryRow> | Partial<CategoryRow>[] | null;
};

export function TransactionsTable({ transactions }: { transactions: TransactionWithCategory[] }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
        <p>אין נתונים להצגה.</p>
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
              <TableHead className="text-right w-[120px]">תאריך</TableHead>
              <TableHead className="text-right">תיאור עסקה</TableHead>
              <TableHead className="text-right w-[150px]">קטגוריה</TableHead>
              <TableHead className="text-right w-[150px]">סכום</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => {
              const catType = Array.isArray(t.categories)
                ? t.categories[0]?.type
                : t.categories?.type;
              const catName = Array.isArray(t.categories)
                ? t.categories[0]?.name_he
                : t.categories?.name_he;
              return (
                <TableRow key={t.id}>
                  <TableCell>
                    {t.date ? new Date(t.date).toLocaleDateString('he-IL') : '-'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {t.description || t.merchant || '-'}
                  </TableCell>
                  <TableCell>{catName || '-'}</TableCell>
                  <TableCell
                    className={`font-semibold text-left ${getAmountColorClass(catType || '')}`}
                    dir="ltr"
                  >
                    {formatCurrency(
                      catType === CATEGORY_TYPES.EXPENSE ? -t.amount : t.amount,
                      true,
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col space-y-3 pt-2">
        {transactions.map((t) => {
          const catType = Array.isArray(t.categories) ? t.categories[0]?.type : t.categories?.type;
          const catName = Array.isArray(t.categories)
            ? t.categories[0]?.name_he
            : t.categories?.name_he;
          return (
            <div
              key={t.id}
              className="flex justify-between items-center p-3 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm">{t.description || t.merchant || '-'}</span>
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{catName || '-'}</span>
                  <span>•</span>
                  <span>{t.date ? new Date(t.date).toLocaleDateString('he-IL') : '-'}</span>
                </div>
              </div>
              <div className={`font-bold ${getAmountColorClass(catType || '')}`} dir="ltr">
                {formatCurrency(catType === CATEGORY_TYPES.EXPENSE ? -t.amount : t.amount, true)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
