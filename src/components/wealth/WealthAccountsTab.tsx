'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from '@/types/database.types';
import { TrendingUp } from 'lucide-react';
import { AccountDialog } from '@/components/finance/AccountDialog';
import { ACCOUNT_TYPES } from '@/lib/constants';

type AccountRow = Database['public']['Tables']['accounts']['Row'];

export function WealthAccountsTab({ accounts }: { accounts: AccountRow[] }) {
  const investmentAccounts = accounts.filter((a) => a.type === ACCOUNT_TYPES.INVESTMENT);
  const totalInvestment = investmentAccounts.reduce(
    (sum, a) => sum + Number(a.current_balance || 0),
    0,
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            חשבונות השקעה
          </CardTitle>
          <CardDescription>
            שווי כולל:{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              ₪{totalInvestment.toLocaleString()}
            </span>
          </CardDescription>
        </div>
        <AccountDialog />
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-4">
          {investmentAccounts.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center border rounded-md bg-zinc-50 dark:bg-zinc-900/50">
              לא הוגדרו חשבונות השקעה.
            </div>
          ) : (
            investmentAccounts.map((account) => (
              <div
                key={account.id}
                className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0 last:pb-0 group"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{account.name}</span>
                  <span className="text-xs text-muted-foreground">
                    עודכן: {new Date(account.updated_at || '').toLocaleDateString('he-IL')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-emerald-600">
                    ₪{Number(account.current_balance || 0).toLocaleString()}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <AccountDialog accountToEdit={account} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
