import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { LiquidityAccountsTab } from '@/components/liquidity/LiquidityAccountsTab';
import { RecurringFlowsTable } from '@/components/liquidity/RecurringFlowsTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Scale } from 'lucide-react';
import { Database } from '@/types/database.types';

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

      <LiquidityAccountsTab accounts={accounts} />

      <div className="pt-8">
        <Card className="border-indigo-100 dark:border-indigo-900 shadow-sm overflow-hidden">
          <CardHeader className="bg-indigo-50/30 dark:bg-indigo-900/10">
            <CardTitle className="text-indigo-800 dark:text-indigo-300">
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
      </div>
    </div>
  );
}
