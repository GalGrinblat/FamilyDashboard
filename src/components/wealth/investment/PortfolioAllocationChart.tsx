'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { INVESTMENT_ACCOUNT_TYPE_LABELS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import type { InvestmentAccountWithHoldings } from '@/types/investment';

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#ec4899',
  '#6366f1',
];

interface PortfolioAllocationChartProps {
  accounts: InvestmentAccountWithHoldings[];
}

export function PortfolioAllocationChart({ accounts }: PortfolioAllocationChartProps) {
  const [view, setView] = useState<'account' | 'ticker'>('account');

  const byAccount = accounts
    .filter((a) => a.totalValueIls > 0)
    .map((a) => ({
      name:
        INVESTMENT_ACCOUNT_TYPE_LABELS[
          a.account_type as keyof typeof INVESTMENT_ACCOUNT_TYPE_LABELS
        ] ?? a.account_type,
      shortName: a.name,
      value: a.totalValueIls,
    }));

  const tickerMap: Record<string, number> = {};
  accounts.forEach((a) => {
    a.holdings.forEach((h) => {
      if (h.currentValueIls && h.currentValueIls > 0) {
        tickerMap[h.ticker] = (tickerMap[h.ticker] ?? 0) + h.currentValueIls;
      }
    });
  });
  const byTicker = Object.entries(tickerMap)
    .map(([name, value]) => ({ name, shortName: name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const data = view === 'account' ? byAccount : byTicker;
  const total = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">הקצאת תיק</CardTitle>
          <div className="flex gap-1">
            <Button
              variant={view === 'account' ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-base px-2"
              onClick={() => setView('account')}
            >
              לפי חשבון
            </Button>
            <Button
              variant={view === 'ticker' ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-base px-2"
              onClick={() => setView('ticker')}
            >
              לפי נייר ערך
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              dataKey="value"
              nameKey="shortName"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatCurrency(typeof value === 'number' ? value : 0), '']}
              labelFormatter={(label) => label}
            />
            <Legend
              formatter={(value) => {
                const item = data.find((d) => d.shortName === value);
                const pct = item && total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                return `${value} (${pct}%)`;
              }}
              wrapperStyle={{ fontSize: '11px', direction: 'rtl' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
