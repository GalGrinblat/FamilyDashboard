import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  InvestmentAccountSchema,
  PortfolioHoldingSchema,
  PortfolioLotSchema,
  PortfolioSnapshotSchema,
} from '@/lib/schemas';
import { computeOpenQuantity, computeAvgCostBasis } from '@/lib/portfolio-calculations';
import type {
  InvestmentAccountWithHoldings,
  PortfolioHoldingWithLots,
  StockPrice,
} from '@/types/investment';
import { fetchStockPrices } from '@/lib/stock-prices';
import { savePortfolioSnapshot } from '@/lib/portfolio-snapshot';
import { PortfolioSummaryKpis } from './PortfolioSummaryKpis';
import { PortfolioAllocationChart } from './PortfolioAllocationChart';
import { PortfolioPerformanceChart } from './PortfolioPerformanceChart';
import { InvestmentAccountTabs } from './InvestmentAccountTabs';

export async function InvestmentTab() {
  const supabase = await createClient();

  const [{ data: rawAccounts }, { data: rawHoldings }, { data: rawLots }, { data: rawSnapshots }] =
    await Promise.all([
      supabase
        .from('investment_accounts')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true }),
      supabase.from('portfolio_holdings').select('*').eq('is_active', true),
      supabase.from('portfolio_lots').select('*').order('purchase_date', { ascending: true }),
      supabase
        .from('portfolio_snapshots')
        .select('*')
        .order('snapshot_date', { ascending: true })
        .gte(
          'snapshot_date',
          new Date(Date.now() - 366 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ),
    ]);

  const accounts = z.array(InvestmentAccountSchema).parse(rawAccounts ?? []);
  const holdings = z.array(PortfolioHoldingSchema).parse(rawHoldings ?? []);
  const lots = z.array(PortfolioLotSchema).parse(rawLots ?? []);
  const snapshots = z.array(PortfolioSnapshotSchema).parse(rawSnapshots ?? []);

  // Collect all unique tickers + USDILS rate
  const tickers = [...new Set(holdings.map((h) => h.ticker))];
  const tickersToFetch = [...tickers, 'USDILS=X'];

  // Fetch live prices (server-side, no CORS issues)
  let prices: Record<string, StockPrice> = {};
  let usdIlsRate = 3.7; // fallback

  if (tickersToFetch.length > 1) {
    try {
      prices = await fetchStockPrices(tickersToFetch);
      if (prices['USDILS=X']?.price) {
        usdIlsRate = prices['USDILS=X'].price;
      }
    } catch (err) {
      console.warn('Failed to fetch stock prices:', err);
    }
  }

  // Build enriched accounts
  const enrichedAccounts: InvestmentAccountWithHoldings[] = accounts.map((account) => {
    const accountHoldings = holdings.filter((h) => h.investment_account_id === account.id);

    if (account.is_managed) {
      // Managed fund — use current_balance directly
      const balance = account.current_balance ?? 0;
      return {
        ...account,
        holdings: [],
        totalValueIls: balance,
        totalCostBasisIls: balance, // no separate cost basis for managed
        unrealizedGainIls: 0,
        unrealizedGainPercent: 0,
        afterTaxEstimateIls: balance,
      };
    }

    // Self-directed — compute from holdings + lots
    const holdingsWithLots: PortfolioHoldingWithLots[] = accountHoldings.map((holding) => {
      const holdingLots = lots.filter((l) => l.holding_id === holding.id);
      const openQuantity = computeOpenQuantity(holdingLots);
      const avgCostBasis = computeAvgCostBasis(holdingLots);
      const totalCostBasis = openQuantity * avgCostBasis;

      const priceData = prices[holding.ticker] ?? null;
      const currentPrice = priceData?.price ?? null;

      const currentValueInCurrency = currentPrice !== null ? openQuantity * currentPrice : null;
      const currentValueIls =
        currentValueInCurrency !== null
          ? holding.currency === 'ILS'
            ? currentValueInCurrency
            : currentValueInCurrency * usdIlsRate
          : null;

      const unrealizedGainAmount =
        currentValueInCurrency !== null ? currentValueInCurrency - totalCostBasis : null;
      const unrealizedGainPercent =
        unrealizedGainAmount !== null && totalCostBasis > 0
          ? (unrealizedGainAmount / totalCostBasis) * 100
          : null;

      return {
        ...holding,
        lots: holdingLots,
        openQuantity,
        avgCostBasis,
        totalCostBasis,
        currentPrice,
        currentValueInCurrency,
        currentValueIls,
        unrealizedGainAmount,
        unrealizedGainPercent,
      };
    });

    const totalValueIls = holdingsWithLots.reduce((sum, h) => sum + (h.currentValueIls ?? 0), 0);
    const totalCostBasisIls = holdingsWithLots.reduce(
      (sum, h) => sum + (h.currency === 'ILS' ? h.totalCostBasis : h.totalCostBasis * usdIlsRate),
      0,
    );
    const unrealizedGainIls = totalValueIls - totalCostBasisIls;
    const unrealizedGainPercent =
      totalCostBasisIls > 0 ? (unrealizedGainIls / totalCostBasisIls) * 100 : 0;

    return {
      ...account,
      holdings: holdingsWithLots,
      totalValueIls,
      totalCostBasisIls,
      unrealizedGainIls,
      unrealizedGainPercent,
      afterTaxEstimateIls: totalValueIls, // computed in card via computeAfterTaxValue
    };
  });

  // Snapshot: fire-and-forget (we already have all the data, so this is fast)
  void savePortfolioSnapshot({ accounts, holdings, lots, prices, usdIlsRate });

  return (
    <div className="space-y-6">
      <PortfolioSummaryKpis accounts={enrichedAccounts} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PortfolioAllocationChart accounts={enrichedAccounts} />
        <PortfolioPerformanceChart snapshots={snapshots} />
      </div>

      <InvestmentAccountTabs accounts={enrichedAccounts} prices={prices} usdIlsRate={usdIlsRate} />
    </div>
  );
}
