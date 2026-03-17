'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronLeft, Trash2 } from 'lucide-react';
import { AddLotDialog } from './AddLotDialog';
import { SellLotDialog } from './SellLotDialog';
import { formatCurrency } from '@/lib/utils';
import type { PortfolioHoldingWithLots, StockPrice } from '@/types/investment';
import type { PortfolioLotRef } from '@/lib/schemas';

interface HoldingsTableProps {
  holdings: PortfolioHoldingWithLots[];
  prices: Record<string, StockPrice>;
  usdIlsRate: number;
}

function formatPrice(price: number, currency: string): string {
  if (currency === 'ILS') return formatCurrency(price);
  return `$${price.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function GainBadge({ percent }: { percent: number }) {
  const isPositive = percent >= 0;
  return (
    <Badge
      variant="outline"
      dir="ltr"
      className={`text-base font-medium ${isPositive ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950' : 'text-rose-600 border-rose-200 bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:bg-rose-950'}`}
    >
      {isPositive ? '+' : ''}
      {percent.toFixed(1)}%
    </Badge>
  );
}

function LotRow({
  lot,
  holdingId,
  ticker,
  currency,
}: {
  lot: PortfolioLotRef;
  holdingId: string;
  ticker: string;
  currency: string;
}) {
  const lotTypeLabel: Record<string, string> = {
    buy: 'קנייה',
    sell: 'מכירה',
    rsu_vest: 'RSU',
    dividend_reinvest: 'דיבידנד',
  };
  const isSell = lot.lot_type === 'sell';
  return (
    <tr className="text-base text-muted-foreground border-t border-dashed group/lot">
      <td className="py-1 pr-8 pl-2">
        <span
          className={`text-base px-1.5 py-0.5 rounded ${isSell ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' : 'bg-muted/60'}`}
        >
          {lotTypeLabel[lot.lot_type] ?? lot.lot_type}
        </span>
      </td>
      <td className="py-1 px-2">{new Date(lot.purchase_date).toLocaleDateString('he-IL')}</td>
      <td className="py-1 px-2 text-left">
        {lot.quantity.toLocaleString('he-IL', { maximumFractionDigits: 4 })}
      </td>
      <td className="py-1 px-2 text-left">{formatPrice(lot.price_per_unit, currency)}</td>
      <td className="py-1 px-2 text-left">
        {lot.total_cost ? formatPrice(lot.total_cost, currency) : '—'}
      </td>
      <td className="py-1 px-2" />
      <td className="py-1 px-2">
        {!isSell && (
          <div className="opacity-0 group-hover/lot:opacity-100 transition-opacity">
            <SellLotDialog
              holdingId={holdingId}
              relatedLotId={lot.id}
              maxQuantity={lot.quantity}
              ticker={ticker}
              currency={currency}
            />
          </div>
        )}
      </td>
    </tr>
  );
}

function HoldingRow({
  holding,
  prices,
  usdIlsRate,
}: {
  holding: PortfolioHoldingWithLots;
  prices: Record<string, StockPrice>;
  usdIlsRate: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const price = prices[holding.ticker];
  const currentPrice = price?.price ?? null;

  const currentValueInCurrency = currentPrice !== null ? holding.openQuantity * currentPrice : null;
  const currentValueIls =
    currentValueInCurrency !== null
      ? holding.currency === 'ILS'
        ? currentValueInCurrency
        : currentValueInCurrency * usdIlsRate
      : null;

  const unrealizedGain =
    currentValueInCurrency !== null ? currentValueInCurrency - holding.totalCostBasis : null;
  const unrealizedGainPct =
    unrealizedGain !== null && holding.totalCostBasis > 0
      ? (unrealizedGain / holding.totalCostBasis) * 100
      : null;

  const handleDelete = async () => {
    if (!confirm(`למחוק את ${holding.ticker} וכל הרכישות שלו?`)) return;
    setDeleting(true);
    await supabase.from('portfolio_holdings').delete().eq('id', holding.id);
    setDeleting(false);
    router.refresh();
  };

  return (
    <>
      <tr className="border-t hover:bg-muted/30 transition-colors group">
        {/* Expand toggle */}
        <td className="py-2 pr-3 pl-1 w-6">
          {holding.lots.length > 0 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-muted-foreground hover:text-foreground"
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          )}
        </td>
        {/* Ticker */}
        <td className="py-2 px-2 font-mono font-semibold text-lg">{holding.ticker}</td>
        {/* Name */}
        <td className="py-2 px-2 text-lg text-muted-foreground max-w-[120px] truncate">
          {holding.name ?? '—'}
        </td>
        {/* Qty */}
        <td className="py-2 px-2 text-lg text-left tabular-nums">
          {holding.openQuantity.toLocaleString('he-IL', { maximumFractionDigits: 4 })}
        </td>
        {/* Avg cost */}
        <td className="py-2 px-2 text-lg text-left tabular-nums text-muted-foreground">
          {formatPrice(holding.avgCostBasis, holding.currency)}
        </td>
        {/* Current price */}
        <td className="py-2 px-2 text-lg text-left tabular-nums">
          {currentPrice !== null ? (
            <span>
              {formatPrice(currentPrice, holding.currency)}
              {price?.changePercent !== null && price?.changePercent !== undefined && (
                <span
                  dir="ltr"
                  className={`text-base mr-1 ${price.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                >
                  ({price.changePercent >= 0 ? '+' : ''}
                  {price.changePercent.toFixed(1)}%)
                </span>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground text-base">טוען...</span>
          )}
        </td>
        {/* Value in ILS */}
        <td className="py-2 px-2 text-lg text-left tabular-nums font-medium">
          {currentValueIls !== null ? formatCurrency(currentValueIls) : '—'}
        </td>
        {/* Gain */}
        <td className="py-2 px-2 text-lg text-left">
          {unrealizedGainPct !== null ? <GainBadge percent={unrealizedGainPct} /> : '—'}
        </td>
        {/* Actions */}
        <td className="py-2 px-2">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <AddLotDialog
              holdingId={holding.id}
              ticker={holding.ticker}
              currency={holding.currency}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </td>
      </tr>
      {/* Lots rows */}
      {expanded &&
        holding.lots.map((lot) => (
          <LotRow
            key={lot.id}
            lot={lot}
            holdingId={holding.id}
            ticker={holding.ticker}
            currency={holding.currency}
          />
        ))}
    </>
  );
}

export function HoldingsTable({ holdings, prices, usdIlsRate }: HoldingsTableProps) {
  if (holdings.length === 0) {
    return (
      <p className="text-lg text-muted-foreground text-center py-4">
        אין ניירות ערך בחשבון זה. הוסף נייר ערך כדי להתחיל.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right">
        <thead>
          <tr className="text-base text-muted-foreground border-b">
            <th className="py-2 pr-3 pl-1 w-6" />
            <th className="py-2 px-2 font-medium">טיקר</th>
            <th className="py-2 px-2 font-medium">שם</th>
            <th className="py-2 px-2 font-medium text-left">כמות</th>
            <th className="py-2 px-2 font-medium text-left">עלות ממוצ׳</th>
            <th className="py-2 px-2 font-medium text-left">מחיר נוכחי</th>
            <th className="py-2 px-2 font-medium text-left">שווי (₪)</th>
            <th className="py-2 px-2 font-medium text-left">רווח</th>
            <th className="py-2 px-2 w-24" />
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <HoldingRow
              key={holding.id}
              holding={holding}
              prices={prices}
              usdIlsRate={usdIlsRate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
