import { getAnalyticsData } from './actions';
import { DomainSpendingChart } from '@/components/analytics/DomainSpendingChart';
import { CashFlowTrendChart } from '@/components/analytics/CashFlowTrendChart';
import { BudgetVsActual } from '@/components/analytics/BudgetVsActual';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';

export default async function AnalyticsPage() {
  const { transactions, recurringFlows, currentNetWorth } = await getAnalyticsData();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader title="דוחות ואנליטיקה" icon={BarChart3} description="ניתוח נתונים אוטומטי המבוסס על תנועות העו״ש שלך." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 pt-2">
        {/* Top Half: Spending Pie & Cash Flow Trend */}
        <div className="col-span-1 md:col-span-3">
          <DomainSpendingChart transactions={transactions} />
        </div>

        <div className="col-span-1 md:col-span-4">
          <CashFlowTrendChart transactions={transactions} />
        </div>

        {/* Bottom Half: Budget vs Actual & Net Worth simple summary */}
        <div className="col-span-1 md:col-span-4 mt-2">
          <BudgetVsActual transactions={transactions} recurringFlows={recurringFlows} />
        </div>

        <div className="col-span-1 md:col-span-3 mt-2">
          <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 bg-indigo-50 dark:bg-indigo-950/20">
            <CardHeader>
              <CardTitle>תמונת מצב שווי נקי (Net Worth)</CardTitle>
              <CardDescription>תמצית כלל הנכסים והחסכונות מול התחייבויות</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center h-[230px]">
              <span
                className="text-5xl font-black text-indigo-700 dark:text-indigo-300 mb-2"
                dir="ltr"
              >
                {formatCurrency(currentNetWorth)}
              </span>
              <p className="text-lg font-medium text-indigo-600 dark:text-indigo-400 max-w-[250px] leading-relaxed">
                שווי נקי נוכחי מבוסס על יתרות זכות בעו״ש ושווי מוערך של דירות / רכבים והשקעות.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
