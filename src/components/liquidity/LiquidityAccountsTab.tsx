'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from '@/types/database.types';
import { Landmark, CreditCard, Trash2 } from 'lucide-react';
import { AccountDialog } from '@/components/finance/AccountDialog';
import { Button } from '@/components/ui/button';
import { ACCOUNT_TYPES } from '@/lib/constants';
import { formatCurrency, getAmountColorClass } from '@/lib/utils';
import { deleteAccountAction } from '@/app/(app)/finance/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type AccountRow = Database['public']['Tables']['accounts']['Row'];

export function LiquidityAccountsTab({ accounts }: { accounts: AccountRow[] }) {
  const router = useRouter();
  const bankAccounts = accounts.filter((a) => a.type === ACCOUNT_TYPES.BANK);
  const creditAccounts = accounts.filter((a) => a.type === ACCOUNT_TYPES.CREDIT_CARD);

  const handleDelete = async (account: AccountRow) => {
    if (!window.confirm(`האם למחוק את "${account.name}" לצמיתות?`)) return;
    const result = await deleteAccountAction(account.id);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success('החשבון נמחק בהצלחה');
      router.refresh();
    }
  };

  const totalBank = bankAccounts.reduce((sum, a) => sum + Number(a.current_balance || 0), 0);
  const totalCredit = creditAccounts.reduce((sum, a) => sum + Number(a.current_balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">ניהול נזילות ועו״ש</h2>
        <AccountDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Bank / Checking Accounts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Landmark className="h-5 w-5 text-indigo-500" />
              חשבונות בנק
            </CardTitle>
            <CardDescription>
              יתרה כוללת:{' '}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100" dir="ltr">
                {formatCurrency(totalBank)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bankAccounts.length === 0 ? (
                <p className="text-lg text-muted-foreground italic">אין חשבונות בנק מוגדרים.</p>
              ) : (
                bankAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex justify-between items-center text-lg border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0 last:pb-0 group"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{account.name}</span>
                      <span className="text-base text-muted-foreground">
                        עודכן: {new Date(account.updated_at || '').toLocaleDateString('he-IL')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-semibold ${getAmountColorClass(Number(account.current_balance || 0) < 0 ? 'expense' : 'income')}`}
                        dir="ltr"
                      >
                        {formatCurrency(Number(account.current_balance || 0))}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <AccountDialog accountToEdit={account} />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                          onClick={() => handleDelete(account)}
                          title="מחק חשבון"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Credit Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-rose-600" />
              כרטיסי אשראי
            </CardTitle>
            <CardDescription>
              ניצול כולל:{' '}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100" dir="ltr">
                {formatCurrency(-totalCredit, true)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {creditAccounts.length === 0 ? (
                <p className="text-lg text-muted-foreground italic">אין כרטיסי אשראי מוגדרים.</p>
              ) : (
                creditAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex justify-between items-center text-lg border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0 last:pb-0 group"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{account.name}</span>
                      <span className="text-base text-muted-foreground">
                        יום חיוב: {account.billing_day || 'לא הוגדר'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-semibold ${getAmountColorClass('expense')}`} dir="ltr">
                        {formatCurrency(-Number(account.current_balance || 0), true)}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <AccountDialog accountToEdit={account} />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                          onClick={() => handleDelete(account)}
                          title="מחק כרטיס"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
