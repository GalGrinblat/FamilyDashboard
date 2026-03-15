import type {
  InvestmentAccountRef,
  PortfolioHoldingRef,
  PortfolioLotRef,
  RsuGrantRef,
  RsuVestRef,
} from '@/lib/schemas';

// Re-export DB row types for convenience
export type { InvestmentAccountRef, PortfolioHoldingRef, PortfolioLotRef, RsuGrantRef, RsuVestRef };

// ─── Computed / enriched types ────────────────────────────────────────────

export interface StockPrice {
  ticker: string;
  price: number;
  currency: string;
  changePercent: number | null;
}

/** A holding with its lots pre-loaded and live price resolved */
export interface PortfolioHoldingWithLots extends PortfolioHoldingRef {
  lots: PortfolioLotRef[];
  // Computed from lots:
  openQuantity: number;
  avgCostBasis: number; // weighted average cost in holding's currency
  totalCostBasis: number; // openQuantity * avgCostBasis
  // From live price API:
  currentPrice: number | null;
  currentValueInCurrency: number | null; // openQuantity * currentPrice
  currentValueIls: number | null; // converted to ILS
  unrealizedGainAmount: number | null; // currentValueInCurrency - totalCostBasis
  unrealizedGainPercent: number | null;
}

/** An investment account with its holdings computed and tax estimates */
export interface InvestmentAccountWithHoldings extends InvestmentAccountRef {
  holdings: PortfolioHoldingWithLots[];
  // Aggregated from holdings (or current_balance for managed accounts):
  totalValueIls: number;
  totalCostBasisIls: number;
  unrealizedGainIls: number;
  unrealizedGainPercent: number;
  afterTaxEstimateIls: number;
}

/** RSU grant with vest events loaded */
export interface RsuGrantWithVests extends RsuGrantRef {
  vests: RsuVestRef[];
  // Computed:
  totalVested: number;
  totalRemaining: number;
  vestingPercent: number; // totalVested / total_shares
  currentPriceUsd: number | null;
  currentValueUsd: number | null;
  estimatedSaleTax: number | null; // USD, based on current price and 2-year rule
  netAfterTaxUsd: number | null;
}
