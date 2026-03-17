'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { PortfolioSnapshotRef } from '@/lib/schemas';

type Range = '1M' | '3M' | '1Y' | 'ALL';

interface PortfolioPerformanceChartProps {
  snapshots: PortfolioSnapshotRef[];
}

const RANGE_DAYS: Record<Range, number | null> = {
  '1M': 30,
  '3M': 90,
  '1Y': 365,
  ALL: null,
};

const NOW = new Date();

export function PortfolioPerformanceChart({ snapshots }: PortfolioPerformanceChartProps) {
  const [range, setRange] = useState<Range>('3M');

  const chartData = useMemo(() => {
    const cutoff = RANGE_DAYS[range];
    const cutoffDate = cutoff
      ? new Date(NOW.getTime() - cutoff * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : null;

    // Group snapshots by date, summing across all accounts
    const byDate: Record<string, { totalValue: number; totalCost: number }> = {};
    for (const snap of snapshots) {
      if (cutoffDate && snap.snapshot_date < cutoffDate) continue;
      if (!byDate[snap.snapshot_date]) {
        byDate[snap.snapshot_date] = { totalValue: 0, totalCost: 0 };
      }
      byDate[snap.snapshot_date].totalValue += snap.total_value_ils;
      byDate[snap.snapshot_date].totalCost += snap.total_cost_basis_ils ?? 0;
    }

    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { totalValue, totalCost }]) => ({
        date,
        label: new Date(date).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' }),
        value: Math.round(totalValue),
        cost: Math.round(totalCost),
      }));
  }, [snapshots, range]);

  if (chartData.length < 2) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">ביצועי תיק לאורך זמן</CardTitle>
          <div className="flex gap-1">
            {(['1M', '3M', '1Y', 'ALL'] as Range[]).map((r) => (
              <Button
                key={r}
                variant={range === r ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-base px-2"
                onClick={() => setRange(r)}
              >
                {r === 'ALL' ? 'הכל' : r}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `₪${(v / 1000).toFixed(0)}k`}
              width={48}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(typeof value === 'number' ? value : 0),
                name === 'value' ? 'שווי שוק' : 'עלות בסיס',
              ]}
              labelFormatter={(label) => label}
              contentStyle={{ direction: 'rtl', fontSize: 12 }}
            />
            <Legend
              formatter={(value) => (value === 'value' ? 'שווי שוק' : 'עלות בסיס')}
              wrapperStyle={{ fontSize: '11px', direction: 'rtl' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="cost"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
