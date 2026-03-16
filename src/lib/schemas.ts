import { z } from 'zod';

export const AccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  currency: z.string(),
  current_balance: z.number(),
  metadata: z.any().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const AssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  estimated_value: z.number().nullable(),
  status: z.string().nullable(),
  metadata: z.any().nullable(),
  attachments: z.any().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const TransactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  date: z.string(),
  description: z.string().nullable(),
  merchant: z.string().nullable(),
  account_id: z.string(),
  category_id: z.string().nullable(),
  trip_id: z.string().nullable(),
  recurring_flow_id: z.string().nullable(),
  is_deduplicated: z.boolean(),
  original_amount: z.number().nullable(),
  installment_number: z.number(),
  total_installments: z.number(),
  asset_id: z.string().nullable(),
  categories: z
    .preprocess(
      (val) => {
        if (Array.isArray(val)) return val[0];
        return val;
      },
      z
        .object({
          name_he: z.string().optional(),
          name_en: z.string().optional(),
          type: z.string(),
          domain: z.string().optional(),
        })
        .nullable(),
    )
    .nullable()
    .default(null),
  metadata: z.any().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const PolicySchema = z.object({
  id: z.string(),
  created_at: z.string(),
  name: z.string(),
  policy_number: z.string().nullable(),
  type: z.string(),
  provider: z.string(),
  premium_amount: z.number(),
  premium_frequency: z.string(),
  renewal_date: z.string().nullable(),
  covered_individuals: z.array(z.string()).nullable(),
  asset_id: z.string().nullable(),
  document_url: z.string().nullable(),
  subtype: z.string().nullable(),
  assets: AssetSchema.nullable().default(null),
});

export const ReminderSchema = z.object({
  id: z.string(),
  title: z.string(),
  due_date: z.string(),
  start_date: z.string().nullable(),
  type: z.string(),
  is_completed: z.boolean().nullable(),
  asset_id: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type AccountRef = z.infer<typeof AccountSchema>;
export type AssetRef = z.infer<typeof AssetSchema>;
export type TransactionRef = z.infer<typeof TransactionSchema>;
export type PolicyRef = z.infer<typeof PolicySchema>;
export type ReminderRef = z.infer<typeof ReminderSchema>;

// ─── Investment schemas ────────────────────────────────────────────────────

export const InvestmentAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  account_type: z.string(),
  broker: z.string().nullable(),
  management_fee_percent: z.number().nullable(),
  is_managed: z.boolean(),
  current_balance: z.number().nullable(),
  histalmut_eligible_date: z.string().nullable(),
  monthly_contribution_ils: z.number().nullable(),
  is_active: z.boolean(),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const PortfolioHoldingSchema = z.object({
  id: z.string(),
  investment_account_id: z.string(),
  ticker: z.string(),
  asset_class: z.string(),
  name: z.string().nullable(),
  currency: z.string(),
  is_active: z.boolean(),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const PortfolioLotSchema = z.object({
  id: z.string(),
  holding_id: z.string(),
  lot_type: z.string(),
  purchase_date: z.string(),
  quantity: z.number(),
  price_per_unit: z.number(),
  total_cost: z.number().nullable(),
  fees: z.number().nullable(),
  related_lot_id: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const RsuGrantSchema = z.object({
  id: z.string(),
  investment_account_id: z.string(),
  ticker: z.string(),
  employer: z.string().nullable(),
  grant_date: z.string(),
  total_shares: z.number(),
  grant_price_usd: z.number().nullable(),
  cliff_months: z.number().nullable(),
  vest_frequency_months: z.number().nullable(),
  shares_per_vest: z.number().nullable(),
  vest_percentage: z.number().nullable(),
  cliff_vest_shares: z.number().nullable(),
  cliff_vest_percentage: z.number().nullable(),
  tax_track: z.string(),
  is_active: z.boolean(),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const RsuVestSchema = z.object({
  id: z.string(),
  grant_id: z.string(),
  vest_date: z.string(),
  shares_vested: z.number(),
  linked_lot_id: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const PortfolioSnapshotSchema = z.object({
  id: z.string(),
  investment_account_id: z.string(),
  snapshot_date: z.string(),
  total_value_ils: z.number(),
  total_cost_basis_ils: z.number().nullable(),
  unrealized_gain_ils: z.number().nullable(),
  usd_ils_rate: z.number().nullable(),
  created_at: z.string().nullable(),
});

export type InvestmentAccountRef = z.infer<typeof InvestmentAccountSchema>;
export type PortfolioHoldingRef = z.infer<typeof PortfolioHoldingSchema>;
export type PortfolioLotRef = z.infer<typeof PortfolioLotSchema>;
export type RsuGrantRef = z.infer<typeof RsuGrantSchema>;
export type RsuVestRef = z.infer<typeof RsuVestSchema>;
export type PortfolioSnapshotRef = z.infer<typeof PortfolioSnapshotSchema>;
