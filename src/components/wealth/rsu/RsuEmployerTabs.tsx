'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RsuGrantCard } from './RsuGrantCard';
import { RsuGrantDialog } from './RsuGrantDialog';
import type { RsuGrantWithVests, StockPrice } from '@/types/investment';

interface RsuEmployerTabsProps {
  grants: RsuGrantWithVests[];
  prices: Record<string, StockPrice>;
  accounts: { id: string; name: string }[];
}

export function RsuEmployerTabs({ grants, prices, accounts }: RsuEmployerTabsProps) {
  const NO_EMPLOYER = 'ללא מעסיק';

  // Group grants by employer, sorted alphabetically
  const grantsByEmployer = grants.reduce<Record<string, RsuGrantWithVests[]>>((acc, grant) => {
    const key = grant.employer ?? NO_EMPLOYER;
    if (!acc[key]) acc[key] = [];
    acc[key].push(grant);
    return acc;
  }, {});

  const employerKeys = Object.keys(grantsByEmployer).sort((a, b) => {
    if (a === NO_EMPLOYER) return 1;
    if (b === NO_EMPLOYER) return -1;
    return a.localeCompare(b, 'he');
  });

  const fallbackAccountId = accounts[0]?.id ?? '';

  return (
    <Tabs defaultValue={employerKeys[0]} dir="rtl">
      <TabsList className="flex flex-wrap h-auto gap-1 p-1 mb-4">
        {employerKeys.map((emp) => (
          <TabsTrigger key={emp} value={emp} className="text-sm">
            {emp}
          </TabsTrigger>
        ))}
      </TabsList>

      {employerKeys.map((emp) => {
        const employerGrants = grantsByEmployer[emp];
        const accountId = employerGrants[0].investment_account_id ?? fallbackAccountId;
        return (
          <TabsContent key={emp} value={emp}>
            <div className="space-y-4">
              {employerGrants.map((grant) => (
                <RsuGrantCard key={grant.id} grant={grant} prices={prices} />
              ))}
              <div className="flex justify-center pt-2">
                <RsuGrantDialog
                  investmentAccountId={accountId}
                  defaultEmployer={emp === NO_EMPLOYER ? '' : emp}
                />
              </div>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
