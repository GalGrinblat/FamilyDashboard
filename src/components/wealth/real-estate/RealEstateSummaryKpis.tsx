'use client';

import { Building2, TrendingUp, Landmark } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { AssetRef } from '@/lib/schemas';
import type { RealEstateMetadata } from '@/types/wealth';
import { SummaryKpisGrid } from '@/components/wealth/shared/SummaryKpisGrid';

interface RealEstateSummaryKpisProps {
  assets: AssetRef[];
}

export function RealEstateSummaryKpis({ assets }: RealEstateSummaryKpisProps) {
  const totalValue = assets.reduce((sum, a) => sum + Number(a.estimated_value ?? 0), 0);

  const totalRent = assets.reduce((sum, a) => {
    const meta = a.metadata as RealEstateMetadata | null;
    return sum + Number(meta?.monthly_rent ?? 0);
  }, 0);

  const totalMortgage = assets.reduce((sum, a) => {
    const meta = a.metadata as RealEstateMetadata | null;
    return sum + Number(meta?.mortgage_payment ?? 0);
  }, 0);

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
