'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvestmentAccountCard } from './InvestmentAccountCard';
import { InvestmentAccountDialog } from './InvestmentAccountDialog';
import type { InvestmentAccountWithHoldings, StockPrice } from '@/types/investment';

interface InvestmentAccountTabsProps {
  accounts: InvestmentAccountWithHoldings[];
  prices: Record<string, StockPrice>;
  usdIlsRate: number;
}

export function InvestmentAccountTabs({
  accounts,
  prices,
  usdIlsRate,
}: InvestmentAccountTabsProps) {
  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 border rounded-lg bg-muted/20">
        <p className="text-sm text-muted-foreground">אין חשבונות השקעה. הוסף חשבון כדי להתחיל.</p>
        <InvestmentAccountDialog />
      </div>
    );
  }

  return (
    <Tabs defaultValue={accounts[0].id} dir="rtl">
      <div className="flex items-center justify-between gap-4 mb-4">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1">
          {accounts.map((account) => (
            <TabsTrigger key={account.id} value={account.id} className="text-sm">
              {account.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <InvestmentAccountDialog />
      </div>

      {accounts.map((account) => (
        <TabsContent key={account.id} value={account.id}>
          <InvestmentAccountCard account={account} prices={prices} usdIlsRate={usdIlsRate} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
