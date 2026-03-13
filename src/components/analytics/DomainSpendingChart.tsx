'use client';

import { useMemo } from 'react';
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CATEGORY_TYPES,
  CATEGORY_DOMAINS,
  CATEGORY_DOMAIN_SHORT_LABELS,
  CategoryDomain,
} from '@/lib/constants';
import { Database } from '@/types/database.types';

type TransactionWithCategory = Database['public']['Tables']['transactions']['Row'] & {
  categories?: { type?: string; domain?: string } | { type?: string; domain?: string }[] | null;
};

// Define colors for domains
const DOMAIN_COLORS: Record<string, string> = {
  [CATEGORY_DOMAINS.HOUSING]: '#6366f1', // indigo
  [CATEGORY_DOMAINS.TRANSPORTATION]: '#f59e0b', // amber
  [CATEGORY_DOMAINS.UTILITIES]: '#06b6d4', // cyan
  [CATEGORY_DOMAINS.INSURANCES]: '#10b981', // emerald
  [CATEGORY_DOMAINS.SUPERMARKET]: '#ec4899', // pink
  [CATEGORY_DOMAINS.HOBBIES]: '#8b5cf6', // violet
  [CATEGORY_DOMAINS.ENTERTAINMENT]: '#f43f5e', // rose
  [CATEGORY_DOMAINS.VACATION]: '#0ea5e9', // sky
  [CATEGORY_DOMAINS.GENERAL]: '#64748b', // slate
};

export function DomainSpendingChart({ transactions }: { transactions: TransactionWithCategory[] }) {
  const data = useMemo(() => {
    // Filter only current month expenses
    const now = new Date();
    const currentMonthData = transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const expenses = currentMonthData.filter((t) => {
      const catType = Array.isArray(t.categories) ? t.categories[0]?.type : t.categories?.type;
      return catType === CATEGORY_TYPES.EXPENSE;
    });

    const domainTotals: Record<string, number> = {};

    expenses.forEach((t) => {
      const domain = Array.isArray(t.categories) ? t.categories[0]?.domain : t.categories?.domain;
      const key = domain || CATEGORY_DOMAINS.GENERAL;
      domainTotals[key] = (domainTotals[key] || 0) + Math.abs(t.amount);
    });

    return Object.entries(domainTotals)
      .map(([domain, amount]) => ({
        name: CATEGORY_DOMAIN_SHORT_LABELS[domain as CategoryDomain] || domain,
        value: amount,
        fill: DOMAIN_COLORS[domain] || DOMAIN_COLORS[CATEGORY_DOMAINS.GENERAL],
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  if (data.length === 0) {
    return (
      <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-8 text-center h-[400px]">
        <p className="text-muted-foreground">אין מספיק נתונים לסוף החודש הנוכחי</p>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
      <CardHeader>
        <CardTitle>התפלגות הוצאות</CardTitle>
        <CardDescription>לפי תחומי ליבה (חודש נוכחי)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: unknown) => [`₪${Number(value).toLocaleString()}`, 'הוצאה']}
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
