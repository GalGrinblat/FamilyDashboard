'use client';

import { Card, CardContent } from '@/components/ui/card';

export interface KpiCardConfig {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  valueClassName?: string;
}

export function SummaryKpisGrid({ items }: { items: KpiCardConfig[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <p className={`text-2xl font-bold tabular-nums ${item.valueClassName ?? ''}`}>
                  {item.value}
                </p>
                {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
              </div>
              {item.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
