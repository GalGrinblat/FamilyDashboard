import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Map } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Database } from '@/types/database.types';

type TransactionRow = Database['public']['Tables']['transactions']['Row'];

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: trip }, { data: transactions }] = await Promise.all([
    supabase.from('trips').select('*').eq('id', id).single(),
    supabase.from('transactions').select('*').eq('trip_id', id).order('date', { ascending: false }),
  ]);

  if (!trip) notFound();

  const txRows = (transactions as TransactionRow[]) || [];
  const totalSpent = txRows.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  const budgetLeft = trip.budget != null ? trip.budget - totalSpent : null;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <PageHeader title={trip.name} icon={Map} />

      {/* Summary KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-zinc-500">תקציב</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400" dir="ltr">
              {trip.budget != null ? formatCurrency(trip.budget) : '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-zinc-500">הוצאות בפועל</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400" dir="ltr">
              {formatCurrency(totalSpent)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-zinc-500">נותר מהתקציב</CardTitle>
          </CardHeader>
          <CardContent>
            {budgetLeft != null ? (
              <p
                className={`text-2xl font-bold ${budgetLeft >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                dir="ltr"
              >
                {formatCurrency(budgetLeft)}
              </p>
            ) : (
              <p className="text-2xl font-bold text-zinc-400">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>עסקאות בחופשה</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
          {txRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
              <p>אין עסקאות משויכות לחופשה זו עדיין.</p>
            </div>
          ) : (
            <Table className="border-t border-zinc-100 dark:border-zinc-800">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-right">תיאור</TableHead>
                  <TableHead className="text-right">בית עסק</TableHead>
                  <TableHead className="text-right">סכום</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txRows.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {new Intl.DateTimeFormat('he-IL').format(new Date(tx.date))}
                    </TableCell>
                    <TableCell className="font-medium">{tx.description || '—'}</TableCell>
                    <TableCell>{tx.merchant || '—'}</TableCell>
                    <TableCell
                      className={`font-medium ${tx.amount < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                      dir="ltr"
                    >
                      {formatCurrency(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
