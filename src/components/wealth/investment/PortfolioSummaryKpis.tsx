'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { InvestmentAccountWithHoldings } from '@/types/investment';
import { computeAfterTaxValue } from '@/lib/portfolio-calculations';

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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">שווי תיק כולל</p>
              <p className="text-2xl font-bold tabular-nums">{formatCurrency(totalValue)}</p>
            </div>
            <Wallet className="h-8 w-8 text-muted-foreground/40" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">רווח / הפסד לא ממומש</p>
              <p
                className={`text-2xl font-bold tabular-nums ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
              >
                {isPositive ? '+' : ''}
                {formatCurrency(totalGain)}
              </p>
              <p
                className={`text-xs tabular-nums ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
              >
                {isPositive ? '▲ +' : '▼ '}
                {totalGainPct.toFixed(1)}%
              </p>
            </div>
            {isPositive ? (
              <TrendingUp className="h-8 w-8 text-emerald-500/40" />
            ) : (
              <TrendingDown className="h-8 w-8 text-rose-500/40" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">שווי אחרי מס (הערכה)</p>
              <p className="text-2xl font-bold tabular-nums">{formatCurrency(totalAfterTax)}</p>
              {totalValue > 0 && (
                <p className="text-xs text-muted-foreground">
                  מס משוער: {formatCurrency(totalValue - totalAfterTax)}
                </p>
              )}
            </div>
            <Wallet className="h-8 w-8 text-muted-foreground/40" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
