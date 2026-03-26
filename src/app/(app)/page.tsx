import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CarFront,
  Home as HomeIcon,
  ShieldCheck,
  Wallet,
  Wrench,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { createClient } from '@/lib/supabase/server';
import { CATEGORY_TYPES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { formatCurrency, getAmountColorClass } from '@/lib/utils';
import Link from 'next/link';

import { AccountSchema, TransactionSchema, ReminderSchema } from '@/lib/schemas';
import { z } from 'zod';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'car_test':
      return <CarFront className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    case 'insurance':
      return <ShieldCheck className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />;
    case 'maintenance':
      return <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    default:
      return <AlertCircle className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />;
  }
};

export default async function Home() {
  const supabase = await createClient();

  // 1. Fetch data in parallel
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);

  const [
    { data: accountsRaw },
    { data: propertiesRaw },
    { data: vehiclesRaw },
    { data: investmentsRaw },
    { data: transactionsRaw },
    { data: remindersRaw },
    { data: recurringFlowsRaw },
  ] = await Promise.all([
    supabase.from('accounts').select('current_balance'),
    supabase.from('properties').select('estimated_value'),
    supabase.from('vehicles').select('estimated_value').eq('status', 'active'),
    supabase.from('investment_accounts').select('current_balance').eq('is_active', true),
    supabase
      .from('transactions')
      .select(
        `
        amount,
        categories ( type )
      `,
      )
      .gte('date', startOfMonth.toISOString()),
    supabase
      .from('reminders')
      .select('*')
      .eq('is_completed', false)
      .lte('due_date', in30Days.toISOString())
      .order('due_date', { ascending: true })
      .limit(5),
    supabase.from('recurring_flows').select('amount, type').eq('is_active', true),
  ]);

  // 2. Process results — parse only the fields we actually selected
  const accounts = z.array(AccountSchema.pick({ current_balance: true })).parse(accountsRaw || []);

  const totalBalance = accounts.reduce((acc, curr) => acc + (curr.current_balance || 0), 0);
  const totalPropertiesValue = (propertiesRaw || []).reduce(
    (acc, curr) => acc + (Number(curr.estimated_value) || 0),
    0,
  );
  const totalVehiclesValue = (vehiclesRaw || []).reduce(
    (acc, curr) => acc + (Number(curr.estimated_value) || 0),
    0,
  );
  const totalInvestmentsValue = (investmentsRaw || []).reduce(
    (acc: number, curr: { current_balance: number | null }) =>
      acc + (Number(curr.current_balance) || 0),
    0,
  );
  const netWorth = totalBalance + totalPropertiesValue + totalVehiclesValue + totalInvestmentsValue;

  const transactions = z.array(TransactionSchema).parse(transactionsRaw || []);

  const monthlyBurnRate = transactions.reduce((acc, curr) => {
    const catType = curr.categories?.type;

    if (catType === CATEGORY_TYPES.EXPENSE) {
      return acc + (curr.amount || 0);
    }
    return acc;
  }, 0);

  const monthlyIncome = transactions.reduce((acc, curr) => {
    const catType = curr.categories?.type;

    if (catType === CATEGORY_TYPES.INCOME) {
      return acc + (curr.amount || 0);
    }
    return acc;
  }, 0);

  const expectedIncome = (recurringFlowsRaw || []).reduce(
    (acc, curr) => (curr.type === 'income' ? acc + Number(curr.amount) : acc),
    0,
  );
  const expectedBurnRate = (recurringFlowsRaw || []).reduce(
    (acc, curr) => (curr.type === 'expense' ? acc + Number(curr.amount) : acc),
    0,
  );
  const expectedCashFlow = expectedIncome - expectedBurnRate;

  const cashFlow = monthlyIncome - monthlyBurnRate;
  const reminders = z.array(ReminderSchema).parse(remindersRaw || []);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader title="ראשי" icon={HomeIcon} />

      {/* Main KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Net Worth */}
        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">שווי נקי (Net Worth)</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" dir="ltr">
              {formatCurrency(netWorth)}
            </div>
            <p className="text-base text-muted-foreground mt-1">סה״כ נכסים וחסכונות</p>
          </CardContent>
        </Card>

        {/* Income */}
        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">הכנסות החודש</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAmountColorClass('income')}`} dir="ltr">
              {formatCurrency(monthlyIncome)}
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <span>החודש</span>
              <span className="font-medium" dir="ltr">
                צפי: {formatCurrency(expectedIncome)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Burn Rate */}
        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">הוצאות החודש</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAmountColorClass('expense')}`} dir="ltr">
              {formatCurrency(-monthlyBurnRate, true)}
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <span>החודש</span>
              <span className="font-medium" dir="ltr">
                צפי: {formatCurrency(-expectedBurnRate, true)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Cash Flow */}
        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">תזרים חודשי (Cash Flow)</CardTitle>
            <Wallet className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getAmountColorClass(cashFlow >= 0 ? 'income' : 'expense')}`}
            >
              <span dir="ltr">{formatCurrency(cashFlow)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <span>בפועל</span>
              <span className="font-medium" dir="ltr">
                צפי: {formatCurrency(expectedCashFlow)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-Grids */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 pt-4">
        {/* Alerts / Reminders */}
        <Card className="col-span-4 shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              התראות ומשימות דחופות
            </CardTitle>
            <CardDescription>
              {reminders && reminders.length > 0
                ? `יש לך ${reminders.length} התראות קרובות הדורשות תשומת לב.`
                : 'אין לך משימות קרובות ל-30 ימים הקרובים.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reminders && reminders.length > 0 ? (
                reminders.map((reminder) => {
                  const isUrgent =
                    new Date(reminder.due_date).getTime() <
                    new Date().getTime() + 7 * 24 * 60 * 60 * 1000; // within 7 days
                  return (
                    <div
                      key={reminder.id}
                      className={`flex items-center p-3 rounded-lg border ${
                        isUrgent
                          ? 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10'
                          : 'border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full ml-4 ${
                          isUrgent
                            ? 'bg-amber-100 dark:bg-amber-900'
                            : 'bg-zinc-100 dark:bg-zinc-800'
                        }`}
                      >
                        {getTypeIcon(reminder.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-lg font-medium leading-none">{reminder.title}</p>
                        <p className="text-lg text-muted-foreground">
                          תאריך יעד: {new Date(reminder.due_date).toLocaleDateString('he-IL')}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-6 text-muted-foreground bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                  הכל תקין, אין משימות דחופות כרגע!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3 shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>פעולות מהירות</CardTitle>
            <CardDescription>גישה מהירה לפעולות נפוצות</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/transactions" className="block">
              <Button variant="outline" className="w-full justify-start h-12">
                <AlertCircle className="mr-2 ml-4 h-5 w-5 text-amber-500" />
                תנועות ללא סיווג
              </Button>
            </Link>
            <Link href="/liquidity" className="block">
              <Button variant="outline" className="w-full justify-start h-12">
                <ArrowDownRight className="mr-2 ml-4 h-5 w-5 text-rose-500" />
                עו״ש ותזרים
              </Button>
            </Link>
            <Link href="/settings" className="block">
              <Button variant="outline" className="w-full justify-start h-12">
                <Wrench className="mr-2 ml-4 h-5 w-5 text-zinc-500" />
                הגדרות מתקדמות
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
