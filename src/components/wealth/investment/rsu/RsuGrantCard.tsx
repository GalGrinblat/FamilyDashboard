'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trash2 } from 'lucide-react';
import { RsuGrantDialog } from './RsuGrantDialog';
import { RsuVestDialog } from './RsuVestDialog';
import { computeRsuSaleTax } from '@/lib/portfolio-calculations';
import { RSU_TAX_TRACK_LABELS } from '@/lib/constants';
import type { RsuGrantWithVests, StockPrice } from '@/types/investment';

interface RsuGrantCardProps {
  grant: RsuGrantWithVests;
  prices: Record<string, StockPrice>;
}

export function RsuGrantCard({ grant, prices }: RsuGrantCardProps) {
  const router = useRouter();
  const supabase = createClient();

  const currentPriceData = prices[grant.ticker];
  const currentPrice = currentPriceData?.price ?? null;

  const vestingPct =
    grant.total_shares > 0 ? Math.min(100, (grant.totalVested / grant.total_shares) * 100) : 0;

  const taxTrackLabel =
    RSU_TAX_TRACK_LABELS[grant.tax_track as keyof typeof RSU_TAX_TRACK_LABELS] ?? grant.tax_track;

  const taxEstimate =
    currentPrice !== null && grant.grant_price_usd != null && grant.totalVested > 0
      ? computeRsuSaleTax({
          salePrice: currentPrice,
          grantPrice: grant.grant_price_usd,
          quantity: grant.totalVested,
          grantDate: grant.grant_date,
          taxTrack: grant.tax_track,
        })
      : null;

  const currentValueUsd = currentPrice !== null ? currentPrice * grant.totalVested : null;
  const netAfterTaxUsd =
    currentValueUsd !== null && taxEstimate !== null
      ? currentValueUsd - taxEstimate.totalTax
      : null;

  const grantDate = new Date(grant.grant_date);
  const twoYearsDate = new Date(grantDate);
  twoYearsDate.setFullYear(twoYearsDate.getFullYear() + 2);
  const isAfter2Years = new Date() >= twoYearsDate;

  const handleDelete = async () => {
    if (!confirm(`למחוק את מענק ה-RSU של ${grant.ticker}?`)) return;
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
            {isAfter2Years && grant.tax_track === 'capital_gains' && (
              <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">
                ✓ 2+ שנים — 25% על רווח
              </Badge>
            )}
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
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">תאריך מענק</p>
            <p>{new Date(grant.grant_date).toLocaleDateString('he-IL')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">מחיר מענק</p>
            <p>{grant.grant_price_usd != null ? `$${grant.grant_price_usd.toFixed(2)}` : '—'}</p>
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
              >
                {currentPrice >= grant.grant_price_usd ? '+' : ''}
                {(((currentPrice - grant.grant_price_usd) / grant.grant_price_usd) * 100).toFixed(
                  1,
                )}
                %
              </p>
            ) : (
              <p>—</p>
            )}
          </div>
        </div>

        {/* Vesting progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              התבגרות: {grant.totalVested.toLocaleString('he-IL')} /{' '}
              {grant.total_shares.toLocaleString('he-IL')} מניות
            </span>
            <span>{vestingPct.toFixed(0)}%</span>
          </div>
          <Progress value={vestingPct} className="h-2" />
        </div>

        {/* Tax estimate */}
        {taxEstimate !== null && currentValueUsd !== null && (
          <div className="rounded-md bg-muted/40 p-3 text-xs space-y-1">
            <p className="font-medium text-muted-foreground mb-2">
              מס משוער במכירה ({grant.totalVested.toLocaleString('he-IL')} מניות)
            </p>
            <div className="flex justify-between">
              <span>מס הכנסה על ערך מענק</span>
              <span>
                $
                {taxEstimate.incomeTaxComponent.toLocaleString('he-IL', {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>מס רווחי הון ({isAfter2Years ? '25%' : '47%'})</span>
              <span>
                $
                {taxEstimate.gainsTaxComponent.toLocaleString('he-IL', {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-1 mt-1">
              <span>סה״כ מס משוער</span>
              <span className="text-rose-600">
                ${taxEstimate.totalTax.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
              </span>
            </div>
            {netAfterTaxUsd !== null && (
              <div className="flex justify-between font-semibold text-emerald-600">
                <span>נטו אחרי מס</span>
                <span>${netAfterTaxUsd.toLocaleString('he-IL', { maximumFractionDigits: 0 })}</span>
              </div>
            )}
          </div>
        )}

        {/* Vest history */}
        {grant.vests.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">אירועי התבגרות</p>
            <div className="space-y-0.5">
              {grant.vests.map((v) => (
                <div
                  key={v.id}
                  className="flex justify-between text-xs py-1 border-b border-dashed last:border-0"
                >
                  <span className="text-muted-foreground">
                    {new Date(v.vest_date).toLocaleDateString('he-IL')}
                  </span>
                  <span>{v.shares_vested.toLocaleString('he-IL')} מניות</span>
                  <span className="text-muted-foreground">FMV: ${v.fmv_at_vest.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <RsuVestDialog grant={grant} />
        </div>
      </CardContent>
    </Card>
  );
}
