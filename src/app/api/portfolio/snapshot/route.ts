import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { InvestmentAccountSchema, PortfolioHoldingSchema, PortfolioLotSchema } from '@/lib/schemas';
import { computeOpenQuantity, computeAvgCostBasis } from '@/lib/portfolio-calculations';
import type { StockPrice } from '@/types/investment';

export async function POST() {
  const supabase = await createClient();

  const [{ data: rawAccounts }, { data: rawHoldings }, { data: rawLots }] = await Promise.all([
    supabase.from('investment_accounts').select('*').eq('is_active', true),
    supabase.from('portfolio_holdings').select('*').eq('is_active', true),
    supabase.from('portfolio_lots').select('*'),
  ]);

  const accounts = z.array(InvestmentAccountSchema).parse(rawAccounts ?? []);
  const holdings = z.array(PortfolioHoldingSchema).parse(rawHoldings ?? []);
  const lots = z.array(PortfolioLotSchema).parse(rawLots ?? []);

  // Collect all tickers + USD/ILS rate
  const tickers = [...new Set(holdings.map((h) => h.ticker))];
  const tickersToFetch = [...tickers, 'USDILS=X'];

  let prices: Record<string, StockPrice> = {};
  let usdIlsRate = 3.7;

  if (tickersToFetch.length > 1) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/stock-price?tickers=${tickersToFetch.join(',')}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        prices = (await res.json()) as Record<string, StockPrice>;
        if (prices['USDILS=X']?.price) {
          usdIlsRate = prices['USDILS=X'].price;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch prices for snapshot:', err);
    }
  }

  const today = new Date().toISOString().split('T')[0];

  const upserts = accounts.map((account) => {
    const accountHoldings = holdings.filter((h) => h.investment_account_id === account.id);

    let totalValueIls: number;
    let totalCostBasisIls: number;

    if (account.is_managed) {
      totalValueIls = account.current_balance ?? 0;
      totalCostBasisIls = totalValueIls;
    } else {
      totalValueIls = 0;
      totalCostBasisIls = 0;

      for (const holding of accountHoldings) {
        const holdingLots = lots.filter((l) => l.holding_id === holding.id);
        const openQty = computeOpenQuantity(holdingLots);
        const avgCost = computeAvgCostBasis(holdingLots);
        const costBasis = openQty * avgCost;

        const price = prices[holding.ticker]?.price ?? null;
        const valueInCurrency = price !== null ? openQty * price : null;
        const valueIls =
          valueInCurrency !== null
            ? holding.currency === 'ILS'
              ? valueInCurrency
              : valueInCurrency * usdIlsRate
            : 0;

        const costBasisIls = holding.currency === 'ILS' ? costBasis : costBasis * usdIlsRate;

        totalValueIls += valueIls;
        totalCostBasisIls += costBasisIls;
      }
    }

    return {
      investment_account_id: account.id,
      snapshot_date: today,
      total_value_ils: totalValueIls,
      total_cost_basis_ils: totalCostBasisIls,
      unrealized_gain_ils: totalValueIls - totalCostBasisIls,
      usd_ils_rate: usdIlsRate,
    };
  });

  if (upserts.length === 0) {
    return NextResponse.json({ ok: true, snapshots: 0 });
  }

  const { error } = await supabase
    .from('portfolio_snapshots')
    .upsert(upserts, { onConflict: 'investment_account_id,snapshot_date' });

  if (error) {
    console.error('Snapshot upsert error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, snapshots: upserts.length });
}
