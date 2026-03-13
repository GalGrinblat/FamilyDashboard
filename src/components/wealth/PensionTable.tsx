'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from '@/types/database.types';
import { Briefcase, Landmark, PiggyBank, GraduationCap, Trash2 } from 'lucide-react';
import { PensionDialog } from './PensionDialog';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatCurrency, getAmountColorClass } from '@/lib/utils';

type AssetRow = Database['public']['Tables']['assets']['Row'];

export function PensionTable({ pensions }: { pensions: AssetRow[] }) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!window.confirm('האם למחוק קופה זו? הפעולה אינה הפיכה.')) return;
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) {
      console.error(error);
      alert('שגיאה במחיקת הקופה');
    } else {
      router.refresh();
    }
  };

  const typeIcons: Record<string, React.ReactNode> = {
    pension_fund: <Briefcase className="h-4 w-4 text-blue-500" />,
    managers_insurance: <Landmark className="h-4 w-4 text-indigo-500" />,
    study_fund: <GraduationCap className="h-4 w-4 text-emerald-500" />,
    provident_fund: <PiggyBank className="h-4 w-4 text-orange-500" />,
  };

  const typeLabels: Record<string, string> = {
    pension_fund: 'קרן פנסיה',
    managers_insurance: 'ביטוח מנהלים',
    study_fund: 'קרן השתלמות',
    provident_fund: 'קופת גמל',
  };

  const totalValue = pensions.reduce((sum, p) => sum + Number(p.estimated_value || 0), 0);

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
          <div className="text-sm text-muted-foreground py-8 text-center border rounded-md bg-zinc-50 dark:bg-zinc-900/50 mt-4">
            לא הוגדרו קופות פנסיה או גמל.
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {pensions.map((pension) => {
              const meta =
                (pension.metadata as {
                  pension_type?: string;
                  employee_percent?: number | string;
                  employer_percent?: number | string;
                } | null) || {};
              const pType = meta.pension_type || 'pension_fund';
              return (
                <div
                  key={pension.id}
                  className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-3 last:border-0 last:pb-0 group"
                >
                  <div className="flex flex-col">
                    <span className="font-medium flex items-center gap-2">
                      {typeIcons[pType]}
                      {pension.name}
                    </span>
                    <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                      <span>{typeLabels[pType]}</span>
                      {(meta.employee_percent || meta.employer_percent) && (
                        <span>
                          הפרשות: {meta.employee_percent ? `עובד ${meta.employee_percent}%` : ''}
                          {meta.employee_percent && meta.employer_percent ? ' | ' : ''}
                          {meta.employer_percent ? `מעסיק ${meta.employer_percent}%` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-semibold ${getAmountColorClass('income')}`}
                      dir="ltr"
                    >
                      {formatCurrency(Number(pension.estimated_value))}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <PensionDialog assetToEdit={pension} />
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(pension.id)}>
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
