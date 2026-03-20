import { HISTALMUT_MONTHLY_CEILING_ILS, TAX_RATES } from '@/lib/constants';
import type { PortfolioLotRef, InvestmentAccountRef } from '@/lib/schemas';

// ─── Lot-level calculations ────────────────────────────────────────────────

/** Sum all open (buy - sell) quantity for a holding's lots */
export function computeOpenQuantity(lots: PortfolioLotRef[]): number {
  return lots.reduce((sum, lot) => {
    if (
      lot.lot_type === 'buy' ||
      lot.lot_type === 'rsu_vest' ||
      lot.lot_type === 'dividend_reinvest'
    ) {
      return sum + lot.quantity;
    }
    if (lot.lot_type === 'sell') {
      return sum - lot.quantity;
    }
    return sum;
  }, 0);
}

/** Weighted average cost basis across all buy lots (in holding's currency) */
export function computeAvgCostBasis(lots: PortfolioLotRef[]): number {
  const buyLots = lots.filter(
    (l) => l.lot_type === 'buy' || l.lot_type === 'rsu_vest' || l.lot_type === 'dividend_reinvest',
  );
  const totalQty = buyLots.reduce((sum, l) => sum + l.quantity, 0);
  if (totalQty === 0) return 0;
  const totalCost = buyLots.reduce((sum, l) => sum + l.quantity * l.price_per_unit, 0);
  return totalCost / totalQty;
}

/** Unrealized gain/loss for an open position */
export function computeUnrealizedGain(
  avgCostBasis: number,
  currentPrice: number,
  openQuantity: number,
): { amount: number; percent: number } {
  const costBasis = avgCostBasis * openQuantity;
  const currentValue = currentPrice * openQuantity;
  const amount = currentValue - costBasis;
  const percent = costBasis > 0 ? (amount / costBasis) * 100 : 0;
  return { amount, percent };
}

// ─── After-tax value estimates ────────────────────────────────────────────
// All taxes apply to gains (current_value - cost_basis) only, not the full value.

interface AfterTaxParams {
  account: InvestmentAccountRef;
  currentValueIls: number;
  costBasisIls: number;
  ownerAge?: number | null; // required for gemel
}

export function computeAfterTaxValue({
  account,
  currentValueIls,
  costBasisIls,
  ownerAge,
}: AfterTaxParams): number {
  const gain = currentValueIls - costBasisIls;
  if (gain <= 0) return currentValueIls; // no tax on losses

  switch (account.account_type) {
    case 'brokerage':
      return currentValueIls - gain * TAX_RATES.CAPITAL_GAINS;

    case 'gemel': {
      const rate =
        ownerAge != null && ownerAge >= 60 ? TAX_RATES.GEMEL_AFTER_60 : TAX_RATES.CAPITAL_GAINS;
      return currentValueIls - gain * rate;
    }

    case 'histalmut': {
      const eligible = account.tax_eligible_date
        ? new Date(account.tax_eligible_date) <= new Date()
        : false;
      if (!eligible) {
        // Before 6 years: all gains taxed at 25%
        return currentValueIls - gain * TAX_RATES.CAPITAL_GAINS;
      }
      // After 6 years: gains on the above-ceiling portion are taxed 25%
      const monthly = account.monthly_contribution_ils ?? 0;
      const aboveCeilingFraction =
        monthly > 0 ? Math.max(0, monthly - HISTALMUT_MONTHLY_CEILING_ILS) / monthly : 0;
      const taxableGain = gain * aboveCeilingFraction;
      return currentValueIls - taxableGain * TAX_RATES.CAPITAL_GAINS;
    }

    case 'rsu':
      // RSU after-tax is calculated at sale time via computeRsuSaleTax
      // Here we return an estimate assuming current price is the sale price
      // and the grant price is the cost basis per share
      return currentValueIls; // placeholder — RSU card shows its own tax breakdown

    default:
      return currentValueIls - gain * TAX_RATES.CAPITAL_GAINS;
  }
}

// ─── RSU tax calculations ─────────────────────────────────────────────────
// Section 102 (capital_gains track):
//   No tax at vest (shares held by trustee).
//   At sale:
//     - Income tax on grant_price × shares (marginal ~47%)
//     - If sale ≥ 2 years from grant date: 25% on (sale_price - grant_price) × shares
//     - If sale < 2 years from grant date: marginal rate on (sale_price - grant_price) × shares
//
// Income track:
//   At sale: full marginal income tax on sale_price × shares

export function computeRsuSaleTax({
  salePrice,
  grantPrice,
  quantity,
  grantDate,
  taxTrack,
}: {
  salePrice: number;
  grantPrice: number;
  quantity: number;
  grantDate: string;
  taxTrack: string;
}): { incomeTaxComponent: number; gainsTaxComponent: number; totalTax: number } {
  if (taxTrack === 'income') {
    const totalTax = salePrice * quantity * TAX_RATES.MARGINAL_INCOME;
    return { incomeTaxComponent: totalTax, gainsTaxComponent: 0, totalTax };
  }

  // Section 102 capital gains track
  const incomeTaxComponent = grantPrice * quantity * TAX_RATES.MARGINAL_INCOME;

  const gainPerShare = salePrice - grantPrice;
  const totalGain = gainPerShare * quantity;

  const grantDateObj = new Date(grantDate);
  const saleDateObj = new Date();
  const twoYearsAfterGrant = new Date(grantDateObj);
  twoYearsAfterGrant.setFullYear(twoYearsAfterGrant.getFullYear() + 2);

  const gainRate =
    saleDateObj >= twoYearsAfterGrant ? TAX_RATES.CAPITAL_GAINS : TAX_RATES.MARGINAL_INCOME;
  const gainsTaxComponent = totalGain > 0 ? totalGain * gainRate : 0;

  return {
    incomeTaxComponent,
    gainsTaxComponent,
    totalTax: incomeTaxComponent + gainsTaxComponent,
  };
}

/** Compute RSU sale tax for a specific future/past sale date */
export function computeRsuSaleTaxForDate({
  salePrice,
  grantPrice,
  quantity,
  grantDate,
  saleDate,
  taxTrack,
}: {
  salePrice: number;
  grantPrice: number;
  quantity: number;
  grantDate: string;
  saleDate: Date;
  taxTrack: string;
}): { incomeTaxComponent: number; gainsTaxComponent: number; totalTax: number } {
  if (taxTrack === 'income') {
    const totalTax = salePrice * quantity * TAX_RATES.MARGINAL_INCOME;
    return { incomeTaxComponent: totalTax, gainsTaxComponent: 0, totalTax };
  }

  const incomeTaxComponent = grantPrice * quantity * TAX_RATES.MARGINAL_INCOME;

  const gainPerShare = salePrice - grantPrice;
  const totalGain = gainPerShare * quantity;

  const grantDateObj = new Date(grantDate);
  const twoYearsAfterGrant = new Date(grantDateObj);
  twoYearsAfterGrant.setFullYear(twoYearsAfterGrant.getFullYear() + 2);

  const gainRate =
    saleDate >= twoYearsAfterGrant ? TAX_RATES.CAPITAL_GAINS : TAX_RATES.MARGINAL_INCOME;
  const gainsTaxComponent = totalGain > 0 ? totalGain * gainRate : 0;

  return {
    incomeTaxComponent,
    gainsTaxComponent,
    totalTax: incomeTaxComponent + gainsTaxComponent,
  };
}
