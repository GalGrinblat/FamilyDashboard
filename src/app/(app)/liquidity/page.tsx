import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { RecurringFlowDialog } from '@/components/liquidity/RecurringFlowDialog';
import { LiquidityAccountsTab } from '@/components/liquidity/LiquidityAccountsTab';
import { RecurringFlowsTable } from '@/components/liquidity/RecurringFlowsTable';
import { MonthlyProjectionTab } from '@/components/liquidity/MonthlyProjectionTab';
import { CashFlowForecastTab } from '@/components/liquidity/CashFlowForecastTab';
import { PageHeader } from '@/components/layout/PageHeader';
import { Scale } from 'lucide-react';
import { Database } from '@/types/database.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { REMINDER_TYPES } from '@/lib/constants';

type AccountRow = Database['public']['Tables']['accounts']['Row'];
type FlowRow = Database['public']['Tables']['recurring_flows']['Row'] & {
  accounts?: { name: string } | null;
  categories?: { domain: string | null } | null;
};

export default async function LiquidityPage() {
  const supabase = await createClient();

  const [
    { data: rawAccounts },
    { data: recurringFlows },
    { data: rawOverrides },
    { data: rawPendingChanges },
  ] = await Promise.all([
    supabase.from('accounts').select('*').order('name', { ascending: true }),
    supabase
      .from('recurring_flows')
      .select('*, accounts(name), categories(domain)')
      .order('created_at', { ascending: false }),
    supabase.from('monthly_overrides').select('*').gte('month_year', format(new Date(), 'yyyy-MM')),
    supabase
      .from('reminders')
      .select('id, recurring_flow_id, target_account_id, title')
      .eq('type', REMINDER_TYPES.PAYMENT_METHOD_CHANGE)
      .eq('is_completed', false),
  ]);

  const accounts = (rawAccounts as AccountRow[]) || [];
  const flows = (recurringFlows as unknown as FlowRow[]) || [];
  const overrides = rawOverrides ?? [];
  const pendingChanges = rawPendingChanges ?? [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader title="עו״ש ותזרים נזיל" icon={Scale} />

      <Tabs defaultValue="accounts" className="w-full" dir="rtl">
        <TabsList className="flex flex-wrap h-auto justify-start gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-800/50">
          <TabsTrigger value="accounts">חשבונות עו״ש</TabsTrigger>
          <TabsTrigger value="recurring">תזרים קבוע</TabsTrigger>
          <TabsTrigger value="projection">תחזית חודשית</TabsTrigger>
          <TabsTrigger value="forecast">תחזית שנתית</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-4">
          <LiquidityAccountsTab accounts={accounts} />
        </TabsContent>

        <TabsContent value="recurring" className="mt-4">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>תקציב ותזרים קבוע (Recurring Flows)</CardTitle>
                <CardDescription>
                  ניהול הכנסות והוצאות קבועות המשפיעות על היתרה הצפויה בסוף החודש.
                </CardDescription>
              </div>
              <RecurringFlowDialog accounts={accounts} />
            </CardHeader>
            <CardContent className="p-0 sm:p-0 pt-0 sm:pt-0">
              <RecurringFlowsTable
                flows={flows}
                accounts={accounts}
                pendingChanges={pendingChanges}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projection" className="mt-4">
          <MonthlyProjectionTab />
        </TabsContent>

        <TabsContent value="forecast" className="mt-4">
          <CashFlowForecastTab accounts={accounts} flows={flows} overrides={overrides} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
