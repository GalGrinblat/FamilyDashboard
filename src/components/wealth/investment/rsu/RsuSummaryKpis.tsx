'use client';

import { TrendingUp, Clock, Receipt } from 'lucide-react';
import { computeRsuSaleTax } from '@/lib/portfolio-calculations';
import type { RsuGrantWithVests } from '@/types/investment';
import { SummaryKpisGrid } from '@/components/wealth/shared/SummaryKpisGrid';

interface RsuSummaryKpisProps {
  grants: RsuGrantWithVests[];
}

function formatUsd(value: number) {
  return `$${value.toLocaleString('he-IL', { maximumFractionDigits: 0 })}`;
}

const today = new Date().toISOString().split('T')[0];

export function RsuSummaryKpis({ grants }: RsuSummaryKpisProps) {
  let totalVestedValue = 0;
  let totalFutureValue = 0;
  let totalEstimatedTax = 0;

  for (const grant of grants) {
    const price = grant.currentPriceUsd;
    if (price == null) continue;

    const vestedShares = grant.vests
      .filter((v) => v.vest_date <= today)
      .reduce((sum, v) => sum + v.shares_vested, 0);

    const remainingShares = Math.max(0, grant.total_shares - vestedShares);

    totalVestedValue += vestedShares * price;
    totalFutureValue += remainingShares * price;

    if (vestedShares > 0 && grant.grant_price_usd != null) {
      const tax = computeRsuSaleTax({
        salePrice: price,
        grantPrice: grant.grant_price_usd,
        quantity: vestedShares,
        grantDate: grant.grant_date,
        taxTrack: grant.tax_track,
      });
      totalEstimatedTax += tax.totalTax;
    }
  }

  const totalVestedNet = totalVestedValue - totalEstimatedTax;

  return (
    <SummaryKpisGrid
      items={[
        {
          label: 'שווי מניות שהבשילו',
          value: formatUsd(totalVestedValue),
          subtitle: totalEstimatedTax > 0 ? `נטו: ${formatUsd(totalVestedNet)}` : undefined,
          icon: <TrendingUp className="h-8 w-8 text-muted-foreground/40" />,
        },
        {
          label: 'שווי מניות עתידיות',
          value: formatUsd(totalFutureValue),
          valueClassName: 'text-muted-foreground',
          icon: <Clock className="h-8 w-8 text-muted-foreground/40" />,
        },
        {
          label: 'מס משוער במכירה',
          value: formatUsd(totalEstimatedTax),
          valueClassName: 'text-rose-600 dark:text-rose-400',
          icon: <Receipt className="h-8 w-8 text-muted-foreground/40" />,
        },
      ]}
    />
  );
}
