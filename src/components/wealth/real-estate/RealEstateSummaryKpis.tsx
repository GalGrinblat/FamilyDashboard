'use client';

import { Building2, TrendingUp, Landmark } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { PropertyRef } from '@/lib/schemas';
import { SummaryKpisGrid } from '@/components/wealth/shared/SummaryKpisGrid';

interface RealEstateSummaryKpisProps {
  properties: PropertyRef[];
}

export function RealEstateSummaryKpis({ properties }: RealEstateSummaryKpisProps) {
  const totalValue = properties.reduce((sum, p) => sum + Number(p.estimated_value ?? 0), 0);
  const totalRent = properties.reduce((sum, p) => sum + Number(p.monthly_rent ?? 0), 0);
  const totalMortgage = properties.reduce((sum, p) => sum + Number(p.mortgage_payment ?? 0), 0);

  return (
    <SummaryKpisGrid
      items={[
        {
          label: 'שווי נדל״ן כולל',
          value: formatCurrency(totalValue),
          icon: <Building2 className="h-8 w-8 text-muted-foreground/40" />,
        },
        {
          label: 'הכנסה חודשית משכירות',
          value: totalRent > 0 ? formatCurrency(totalRent) : '—',
          valueClassName: totalRent > 0 ? 'text-emerald-600 dark:text-emerald-400' : '',
          icon: <TrendingUp className="h-8 w-8 text-muted-foreground/40" />,
        },
        {
          label: 'תשלומי משכנתא חודשיים',
          value: totalMortgage > 0 ? formatCurrency(totalMortgage) : '—',
          valueClassName: totalMortgage > 0 ? 'text-rose-600 dark:text-rose-400' : '',
          icon: <Landmark className="h-8 w-8 text-muted-foreground/40" />,
        },
      ]}
    />
  );
}
