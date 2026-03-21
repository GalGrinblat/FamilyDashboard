'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, PiggyBank, GraduationCap, Trash2 } from 'lucide-react';
import { PensionDialog } from './PensionDialog';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatCurrency, getAmountColorClass } from '@/lib/utils';
import type { InvestmentAccountRef } from '@/lib/schemas';
import { INVESTMENT_ACCOUNT_TYPE_LABELS } from '@/lib/constants';

export function PensionTable({ pensions }: { pensions: InvestmentAccountRef[] }) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!window.confirm('האם למחוק קופה זו? הפעולה אינה הפיכה.')) return;
    const { error } = await supabase
      .from('investment_accounts')
      .update({ is_active: false })
      .eq('id', id);
    if (error) {
      if (process.env.NODE_ENV === "development") console.error(error);
      alert('שגיאה בהסרת הקופה');
    } else {
      router.refresh();
    }
  };

  const typeIcons: Record<string, React.ReactNode> = {
    pension: <Briefcase className="h-4 w-4 text-blue-500" />,
    gemel: <GraduationCap className="h-4 w-4 text-orange-500" />,
  };

  const totalValue = pensions.reduce((sum, p) => sum + Number(p.current_balance || 0), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-indigo-500" />
            פנסיה וגמל
          </CardTitle>
          <CardDescription>
            סך צבירה פנסיונית:{' '}
            <span className={`font-semibold ${getAmountColorClass('income')}`} dir="ltr">
              {formatCurrency(totalValue)}
            </span>
          </CardDescription>
        </div>
        <PensionDialog />
      </CardHeader>
      <CardContent>
        {pensions.length === 0 ? (
          <div className="text-lg text-muted-foreground py-8 text-center border rounded-md bg-zinc-50 dark:bg-zinc-900/50 mt-4">
            לא הוגדרו קופות פנסיה או גמל.
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {pensions.map((pension) => (
              <div
                key={pension.id}
                className="flex justify-between items-center text-lg border-b border-zinc-100 dark:border-zinc-800 pb-3 last:border-0 last:pb-0 group"
              >
                <div className="flex flex-col">
                  <span className="font-medium flex items-center gap-2">
                    {typeIcons[pension.account_type] || (
                      <PiggyBank className="h-4 w-4 text-zinc-400" />
                    )}
                    {pension.name}
                  </span>
                  <div className="text-base text-muted-foreground flex gap-3 mt-1">
                    <span>
                      {INVESTMENT_ACCOUNT_TYPE_LABELS[
                        pension.account_type as keyof typeof INVESTMENT_ACCOUNT_TYPE_LABELS
                      ] || pension.account_type}
                    </span>
                    {pension.broker && <span>{pension.broker}</span>}
                    {pension.monthly_contribution_ils && pension.monthly_contribution_ils > 0 && (
                      <span>הפרשה: {formatCurrency(pension.monthly_contribution_ils)}/חודש</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-semibold ${getAmountColorClass('income')}`} dir="ltr">
                    {formatCurrency(Number(pension.current_balance))}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PensionDialog accountToEdit={pension} />
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(pension.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
