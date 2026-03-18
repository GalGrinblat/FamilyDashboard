'use client';

import { useMemo } from 'react';
import {
  Bar,
  ComposedChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from '@/types/database.types';
import { ACCOUNT_TYPES, CATEGORY_TYPES } from '@/lib/constants';
import { addMonths, format, startOfMonth } from 'date-fns';
import { he } from 'date-fns/locale';

type AccountRow = Database['public']['Tables']['accounts']['Row'];
type FlowRow = Database['public']['Tables']['recurring_flows']['Row'];
type Override = Database['public']['Tables']['monthly_overrides']['Row'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function toMonthly(amount: number, frequency: string | null): number {
  if (frequency === 'yearly') return amount / 12;
  if (frequency === 'weekly') return (amount * 52) / 12;
  return amount; // 'monthly' or null → treat as monthly
}

function flowActiveInMonth(flow: FlowRow, monthKey: string): boolean {
  if (!flow.is_active) return false;
  // Use substring(0,7) string comparison to avoid UTC timezone shift
  // when parsing ISO date strings like "2025-03-01" with new Date()
  const startOk = !flow.start_date || flow.start_date.substring(0, 7) <= monthKey;
  const endOk = !flow.end_date || flow.end_date.substring(0, 7) >= monthKey;
  return startOk && endOk;
}

function getMonthlyAmount(flow: FlowRow, monthKey: string, overrides: Override[]): number {
  if (flow.frequency === 'monthly') {
    // recurring_flow_id is nullable in DB — null !== flow.id, so null rows never match
    const ov = overrides.find((o) => o.recurring_flow_id === flow.id && o.month_year === monthKey);
    if (ov) return Number(ov.override_amount);
  }
  return toMonthly(Number(flow.amount), flow.frequency);
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  accounts: AccountRow[];
  flows: FlowRow[];
  overrides: Override[];
}

export function CashFlowForecastTab({ accounts, flows, overrides }: Props) {
  const data = useMemo(() => {
    const startBalance = accounts
      .filter((a) => a.type === ACCOUNT_TYPES.BANK || a.type === 'checking')
      .reduce((s, a) => s + (a.current_balance ?? 0), 0);

    const months = Array.from({ length: 6 }, (_, i) => addMonths(startOfMonth(new Date()), i));

    let running = startBalance;
    return months.map((month) => {
      const key = format(month, 'yyyy-MM');
      const income = flows
        .filter((f) => f.type === CATEGORY_TYPES.INCOME && flowActiveInMonth(f, key))
        .reduce((s, f) => s + getMonthlyAmount(f, key, overrides), 0);
      const expense = flows
        .filter((f) => f.type === CATEGORY_TYPES.EXPENSE && flowActiveInMonth(f, key))
        .reduce((s, f) => s + getMonthlyAmount(f, key, overrides), 0);
      running += income - expense;
      return {
        name: format(month, 'MMM yy', { locale: he }),
        הכנסות: income,
        הוצאות: expense,
        יתרה: running,
      };
    });
  }, [accounts, flows, overrides]);

  const hasFlows = flows.some((f) => f.is_active);

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
      <CardHeader>
        <CardTitle>תחזית תזרים שנתית</CardTitle>
        <CardDescription>
          תחזית 6 חודשים קדימה. תזרימים שנתיים מחולקים לחלקים חודשיים שווים. יתרה מחושבת מיתרת הבנק
          הנוכחית.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasFlows ? (
          <p className="text-center text-muted-foreground py-8 text-base">
            הוסף תזרימים קבועים כדי לקבל תחזית תזרים
          </p>
        ) : (
          <div className="h-[350px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                  className="dark:stroke-zinc-800"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis
                  yAxisId="flows"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280' }}
                  tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="balance"
                  orientation="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280' }}
                  tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: unknown) => [`₪${Number(value).toLocaleString()}`, '']}
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    textAlign: 'right',
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '20px' }}
                />
                <Bar
                  yAxisId="flows"
                  dataKey="הכנסות"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  yAxisId="flows"
                  dataKey="הוצאות"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Line
                  yAxisId="balance"
                  dataKey="יתרה"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#6366f1' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
