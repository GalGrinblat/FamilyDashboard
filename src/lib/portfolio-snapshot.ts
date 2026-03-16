import { createClient } from '@/lib/supabase/server';
import { computeOpenQuantity, computeAvgCostBasis } from '@/lib/portfolio-calculations';
import type { InvestmentAccountRef, PortfolioHoldingRef, PortfolioLotRef } from '@/lib/schemas';
import type { StockPrice } from '@/types/investment';

interface SnapshotParams {
  accounts: InvestmentAccountRef[];
  holdings: PortfolioHoldingRef[];
  lots: PortfolioLotRef[];
  prices: Record<string, StockPrice>;
  usdIlsRate: number;
}

export async function savePortfolioSnapshot({
  accounts,
  holdings,
  lots,
  prices,
  usdIlsRate,
}: SnapshotParams): Promise<void> {
  const supabase = await createClient();
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

  if (upserts.length === 0) return;

  const { error } = await supabase
    .from('portfolio_snapshots')
    .upsert(upserts, { onConflict: 'investment_account_id,snapshot_date' });

  if (error) {
    console.error('Snapshot upsert error:', error);
  }
}
