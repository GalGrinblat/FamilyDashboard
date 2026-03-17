'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { RsuGrantDialog } from './RsuGrantDialog';
import { computeRsuSaleTax } from '@/lib/portfolio-calculations';
import { RSU_TAX_TRACK_LABELS } from '@/lib/constants';
import type { RsuGrantWithVests, StockPrice } from '@/types/investment';

interface RsuGrantCardProps {
  grant: RsuGrantWithVests;
  prices: Record<string, StockPrice>;
}

const todayStr = new Date().toISOString().split('T')[0];

function formatUsd(value: number) {
  return `$${value.toLocaleString('he-IL', { maximumFractionDigits: 0 })}`;
}

export function RsuGrantCard({ grant, prices }: RsuGrantCardProps) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const currentPriceData = prices[grant.ticker];
  const currentPrice = currentPriceData?.price ?? null;

  // 2-year test from grant date (same for all lots in this grant)
  const twoYearsDate = new Date(grant.grant_date);
  twoYearsDate.setFullYear(twoYearsDate.getFullYear() + 2);
  const isAfter2Years = new Date() >= twoYearsDate;
  const taxRateLabel = isAfter2Years ? '≥ 2 שנים (25%)' : '< 2 שנים (47%)';

  const vestedVests = grant.vests.filter((v) => v.vest_date <= todayStr);
  const futureVests = grant.vests.filter((v) => v.vest_date > todayStr);
  const totalVestedShares = vestedVests.reduce((sum, v) => sum + v.shares_vested, 0);

  const vestingPct =
    grant.total_shares > 0 ? Math.min(100, (totalVestedShares / grant.total_shares) * 100) : 0;

  const taxTrackLabel =
    RSU_TAX_TRACK_LABELS[grant.tax_track as keyof typeof RSU_TAX_TRACK_LABELS] ?? grant.tax_track;

  // Grant-level tax estimate (all vested shares sold today)
  const grantTaxEstimate =
    currentPrice !== null && grant.grant_price_usd != null && totalVestedShares > 0
      ? computeRsuSaleTax({
          salePrice: currentPrice,
          grantPrice: grant.grant_price_usd,
          quantity: totalVestedShares,
          grantDate: grant.grant_date,
          taxTrack: grant.tax_track,
        })
      : null;

  const grantVestedGross = currentPrice !== null ? currentPrice * totalVestedShares : null;
  const grantVestedNet =
    grantVestedGross !== null && grantTaxEstimate !== null
      ? grantVestedGross - grantTaxEstimate.totalTax
      : null;

  const handleDelete = async () => {
    if (!confirm(`למחוק את מענק ה-RSU של ${grant.ticker}?`)) return;
    // Delete linked portfolio_lots (not cascade-deleted with grant)
    for (const vest of grant.vests) {
      if (vest.linked_lot_id) {
        await supabase.from('portfolio_lots').delete().eq('id', vest.linked_lot_id);
      }
    }
    await supabase.from('rsu_grants').delete().eq('id', grant.id);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm font-mono">{grant.ticker}</span>
            {grant.employer && (
              <span className="text-xs text-muted-foreground">{grant.employer}</span>
            )}
            <Badge
              variant={grant.tax_track === 'capital_gains' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {taxTrackLabel}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${isAfter2Years ? 'text-emerald-600 border-emerald-300' : 'text-amber-600 border-amber-300'}`}
            >
              {isAfter2Years ? '✓' : '⏳'} {taxRateLabel}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <RsuGrantDialog
              investmentAccountId={grant.investment_account_id}
              grantToEdit={grant}
              triggerButton={
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                  ערוך
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? 'כווץ' : 'הרחב'}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Collapsed summary strip — always visible */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs">
          <div className="flex gap-1 items-baseline">
            <span className="text-muted-foreground">הבשלה:</span>
            <span className="font-medium tabular-nums" dir="ltr">
              {totalVestedShares.toLocaleString('he-IL')} /{' '}
              {grant.total_shares.toLocaleString('he-IL')}
            </span>
            <span className="text-muted-foreground" dir="ltr">
              ({vestingPct.toFixed(0)}%)
            </span>
          </div>
          <div className="flex gap-1 items-baseline">
            <span className="text-muted-foreground">מחיר:</span>
            <span className="font-medium tabular-nums">
              {currentPrice != null ? `$${currentPrice.toFixed(2)}` : '—'}
            </span>
            {currentPrice != null && grant.grant_price_usd != null && (
              <span
                dir="ltr"
                className={`tabular-nums ${currentPrice >= grant.grant_price_usd ? 'text-emerald-600' : 'text-rose-600'}`}
              >
                ({currentPrice >= grant.grant_price_usd ? '+' : ''}
                {(((currentPrice - grant.grant_price_usd) / grant.grant_price_usd) * 100).toFixed(
                  1,
                )}
                %)
              </span>
            )}
          </div>
          <div className="flex gap-1 items-baseline">
            <span className="text-muted-foreground">ברוטו:</span>
            <span className="font-medium tabular-nums">
              {grantVestedGross != null ? formatUsd(grantVestedGross) : '—'}
            </span>
          </div>
          <div className="flex gap-1 items-baseline">
            <span className="text-muted-foreground">נטו:</span>
            <span className="font-medium tabular-nums text-emerald-600">
              {grantVestedNet != null ? formatUsd(grantVestedNet) : '—'}
            </span>
          </div>
        </div>

        <Progress value={vestingPct} className="h-1.5" />

        {/* Expanded detail */}
        {expanded && (
          <div className="space-y-4 pt-2 border-t">
            {/* Key metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">תאריך מענק</p>
                <p>{new Date(grant.grant_date).toLocaleDateString('he-IL')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">מחיר מענק</p>
                <p>
                  {grant.grant_price_usd != null ? `$${grant.grant_price_usd.toFixed(2)}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">מחיר נוכחי</p>
                <p>{currentPrice != null ? `$${currentPrice.toFixed(2)}` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">רווח ממענק</p>
                {currentPrice != null && grant.grant_price_usd != null ? (
                  <p
                    className={
                      currentPrice >= grant.grant_price_usd ? 'text-emerald-600' : 'text-rose-600'
                    }
                    dir="ltr"
                  >
                    {currentPrice >= grant.grant_price_usd ? '+' : ''}
                    {(
                      ((currentPrice - grant.grant_price_usd) / grant.grant_price_usd) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                ) : (
                  <p>—</p>
                )}
              </div>
            </div>

            {/* Vest schedule table */}
            {grant.vests.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">אירועי הבשלה</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground border-b">
                        <th className="text-right py-1 pr-2 font-normal">תאריך</th>
                        <th className="text-right py-1 px-2 font-normal">מניות</th>
                        <th className="text-right py-1 px-2 font-normal">סטטוס</th>
                        <th className="text-right py-1 px-2 font-normal">מס</th>
                        <th className="text-left py-1 px-2 font-normal">שווי ברוטו</th>
                        <th className="text-left py-1 pl-2 font-normal">נטו (אחרי מס)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...vestedVests, ...futureVests].map((v) => {
                        const isVested = v.vest_date <= todayStr;
                        const grossValue =
                          isVested && currentPrice != null ? v.shares_vested * currentPrice : null;
                        const lotTax =
                          grossValue != null && grant.grant_price_usd != null
                            ? computeRsuSaleTax({
                                salePrice: currentPrice!,
                                grantPrice: grant.grant_price_usd,
                                quantity: v.shares_vested,
                                grantDate: grant.grant_date,
                                taxTrack: grant.tax_track,
                              })
                            : null;
                        const netValue =
                          grossValue != null && lotTax != null
                            ? grossValue - lotTax.totalTax
                            : null;

                        return (
                          <tr key={v.id} className="border-b border-dashed last:border-0">
                            <td className="py-1 pr-2">
                              {new Date(v.vest_date).toLocaleDateString('he-IL')}
                            </td>
                            <td className="py-1 px-2">{v.shares_vested.toLocaleString('he-IL')}</td>
                            <td className="py-1 px-2">
                              {isVested ? (
                                <span className="text-emerald-600">✓ הבשיל</span>
                              ) : (
                                <span className="text-muted-foreground">⏳ עתידי</span>
                              )}
                            </td>
                            <td className="py-1 px-2">
                              {isAfter2Years ? (
                                <span className="text-emerald-600">≥ 2 שנים</span>
                              ) : (
                                <span className="text-amber-600">&lt; 2 שנים</span>
                              )}
                            </td>
                            <td className="py-1 px-2 text-left tabular-nums">
                              {grossValue != null ? formatUsd(grossValue) : '—'}
                            </td>
                            <td className="py-1 pl-2 text-left tabular-nums font-medium">
                              {netValue != null ? (
                                <span className="text-emerald-600">{formatUsd(netValue)}</span>
                              ) : (
                                '—'
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Grant-level summary */}
                {grantVestedGross != null && grantTaxEstimate != null && (
                  <div className="rounded-md bg-muted/40 p-3 text-xs space-y-1">
                    <p className="font-medium text-muted-foreground mb-1">
                      סיכום — {totalVestedShares.toLocaleString('he-IL')} מניות שהבשילו
                    </p>
                    <div className="flex justify-between">
                      <span>שווי ברוטו</span>
                      <span>{formatUsd(grantVestedGross)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>מס הכנסה על ערך מענק</span>
                      <span>{formatUsd(grantTaxEstimate.incomeTaxComponent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>מס רווחי הון ({isAfter2Years ? '25%' : '47%'})</span>
                      <span>{formatUsd(grantTaxEstimate.gainsTaxComponent)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                      <span>סה״כ מס משוער</span>
                      <span className="text-rose-600">{formatUsd(grantTaxEstimate.totalTax)}</span>
                    </div>
                    {grantVestedNet != null && (
                      <div className="flex justify-between font-semibold text-emerald-600">
                        <span>נטו אחרי מס</span>
                        <span>{formatUsd(grantVestedNet)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
