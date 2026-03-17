import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { LiquidityAccountsTab } from '@/components/liquidity/LiquidityAccountsTab';
import { RecurringFlowsTable } from '@/components/liquidity/RecurringFlowsTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Scale } from 'lucide-react';
import { Database } from '@/types/database.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type AccountRow = Database['public']['Tables']['accounts']['Row'];
type FlowRow = Database['public']['Tables']['recurring_flows']['Row'] & {
  accounts?: { name: string } | null;
};

export default async function LiquidityPage() {
  const supabase = await createClient();

  // Fetch accounts
  const { data: rawAccounts } = await supabase
    .from('accounts')
    .select('*')
    .order('name', { ascending: true });

  const accounts = (rawAccounts as AccountRow[]) || [];

  // Fetch recurring flows
  const { data: recurringFlows } = await supabase
    .from('recurring_flows')
    .select('*, accounts(name)')
    .order('created_at', { ascending: false });

  const flows = (recurringFlows as unknown as FlowRow[]) || [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader title="עו״ש ותזרים נזיל" icon={Scale} />

      <Tabs defaultValue="accounts" className="w-full" dir="rtl">
        <TabsList className="flex flex-wrap h-auto justify-start gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-800/50">
          <TabsTrigger value="accounts">חשבונות עו״ש</TabsTrigger>
          <TabsTrigger value="recurring">תזרים קבוע</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-4">
          <LiquidityAccountsTab accounts={accounts} />
        </TabsContent>

        <TabsContent value="recurring" className="mt-4">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle>
                תקציב ותזרים קבוע (Recurring Flows)
              </CardTitle>
              <CardDescription>
                ניהול הכנסות והוצאות קבועות המשפיעות על היתרה הצפויה בסוף החודש.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-0 pt-0 sm:pt-0">
              <RecurringFlowsTable flows={flows} accounts={accounts} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
