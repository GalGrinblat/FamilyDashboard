'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from '@/types/database.types';
import { Receipt, Trash2 } from 'lucide-react';
import { ContractDialog } from './ContractDialog';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatCurrency, getAmountColorClass } from '@/lib/utils';

type RecurringFlowRow = Database['public']['Tables']['recurring_flows']['Row'];

export function ContractsTab({ contracts }: { contracts: RecurringFlowRow[] }) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!window.confirm('האם למחוק ספק זה?')) return;
    const { error } = await supabase.from('recurring_flows').delete().eq('id', id);
    if (error) {
      console.error(error);
      alert('שגיאה במחיקת ספק');
    } else {
      router.refresh();
    }
  };

  const totalCost = contracts.reduce((sum, c) => sum + Number(c.amount || 0), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-indigo-500" />
            חוזים ושירותים למגורים
          </CardTitle>
          <CardDescription>
            סך עלות חודשית מוערכת:{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100" dir="ltr">
              {formatCurrency(totalCost)}
            </span>
          </CardDescription>
        </div>
        <ContractDialog />
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <div className="text-lg text-muted-foreground py-8 text-center border rounded-md bg-zinc-50 dark:bg-zinc-900/50 mt-4">
            לא תועדו חוזי ספקים או תשלומי דיור.
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {contracts.map((contract) => {
              const isExpired = contract.end_date && new Date(contract.end_date) < new Date();
              return (
                <div
                  key={contract.id}
                  className="flex justify-between items-center text-lg border-b border-zinc-100 dark:border-zinc-800 pb-3 last:border-0 last:pb-0 group"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{contract.name}</span>
                    <span
                      className={`text-base ${isExpired ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}
                    >
                      {contract.end_date
                        ? `עד: ${new Date(contract.end_date).toLocaleDateString('he-IL')}`
                        : 'ללא תאריך סיום'}
                      {isExpired ? ' (פג תוקף)' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold ${getAmountColorClass('expense')}`} dir="ltr">
                      {formatCurrency(-Number(contract.amount), true)}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ContractDialog contractToEdit={contract} />
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(contract.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
