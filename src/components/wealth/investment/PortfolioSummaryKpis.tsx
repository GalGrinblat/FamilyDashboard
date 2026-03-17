'use client';

import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { InvestmentAccountWithHoldings } from '@/types/investment';
import { computeAfterTaxValue } from '@/lib/portfolio-calculations';
import { SummaryKpisGrid } from '@/components/wealth/shared/SummaryKpisGrid';

interface PortfolioSummaryKpisProps {
  accounts: InvestmentAccountWithHoldings[];
}

export function PortfolioSummaryKpis({ accounts }: PortfolioSummaryKpisProps) {
  const totalValue = accounts.reduce((sum, a) => sum + a.totalValueIls, 0);
  const totalCostBasis = accounts.reduce((sum, a) => sum + a.totalCostBasisIls, 0);
  const totalGain = totalValue - totalCostBasis;
  const totalGainPct = totalCostBasis > 0 ? (totalGain / totalCostBasis) * 100 : 0;

  const totalAfterTax = accounts.reduce(
    (sum, a) =>
      sum +
      computeAfterTaxValue({
        account: a,
        currentValueIls: a.totalValueIls,
        costBasisIls: a.totalCostBasisIls,
      }),
    0,
  );

  const isPositive = totalGain >= 0;

  return (
    <SummaryKpisGrid
      items={[
        {
          label: 'שווי תיק כולל',
          value: formatCurrency(totalValue),
          icon: <Wallet className="h-8 w-8 text-muted-foreground/40" />,
        },
        {
          label: 'רווח / הפסד לא ממומש',
          value: `${isPositive ? '+' : ''}${formatCurrency(totalGain)}`,
          subtitle: `${isPositive ? '▲ +' : '▼ '}${totalGainPct.toFixed(1)}%`,
          valueClassName: isPositive
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-rose-600 dark:text-rose-400',
          icon: isPositive ? (
            <TrendingUp className="h-8 w-8 text-emerald-500/40" />
          ) : (
            <TrendingDown className="h-8 w-8 text-rose-500/40" />
          ),
        },
        {
          label: 'שווי אחרי מס (הערכה)',
          value: formatCurrency(totalAfterTax),
          subtitle:
            totalValue > 0 ? `מס משוער: ${formatCurrency(totalValue - totalAfterTax)}` : undefined,
          icon: <Wallet className="h-8 w-8 text-muted-foreground/40" />,
        },
      ]}
    />
  );
}
