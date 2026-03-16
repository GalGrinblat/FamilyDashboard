import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { InvestmentAccountSchema, PortfolioHoldingSchema, PortfolioLotSchema } from '@/lib/schemas';
import { fetchStockPrices } from '@/lib/stock-prices';
import { savePortfolioSnapshot } from '@/lib/portfolio-snapshot';

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

  const tickers = [...new Set(holdings.map((h) => h.ticker))];
  const tickersToFetch = [...tickers, 'USDILS=X'];

  let usdIlsRate = 3.7;
  let prices = {};

  if (tickersToFetch.length > 1) {
    try {
      prices = await fetchStockPrices(tickersToFetch);
      const usdIls = (prices as Record<string, { price: number }>)['USDILS=X'];
      if (usdIls?.price) usdIlsRate = usdIls.price;
    } catch (err) {
      console.warn('Failed to fetch prices for snapshot:', err);
    }
  }

  await savePortfolioSnapshot({ accounts, holdings, lots, prices, usdIlsRate });

  return NextResponse.json({ ok: true });
}
