'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Clock, Receipt } from 'lucide-react';
import { computeRsuSaleTax } from '@/lib/portfolio-calculations';
import type { RsuGrantWithVests } from '@/types/investment';

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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">שווי מניות שהבשילו</p>
              <p className="text-2xl font-bold tabular-nums">{formatUsd(totalVestedValue)}</p>
              {totalEstimatedTax > 0 && (
                <p className="text-xs text-muted-foreground">נטו: {formatUsd(totalVestedNet)}</p>
              )}
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground/40" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">שווי מניות עתידיות</p>
              <p className="text-2xl font-bold tabular-nums text-muted-foreground">
                {formatUsd(totalFutureValue)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground/40" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">מס משוער במכירה</p>
              <p className="text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
                {formatUsd(totalEstimatedTax)}
              </p>
            </div>
            <Receipt className="h-8 w-8 text-muted-foreground/40" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
