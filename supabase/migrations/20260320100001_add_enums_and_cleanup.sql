-- Phase 1: Add PostgreSQL enums for all discriminator columns
-- Rename ambiguous columns, drop redundant columns,
-- add check constraints, and add recurring reminder support.

-- ── 1. Create enum types ─────────────────────────────────────────────────────

CREATE TYPE account_type AS ENUM ('bank', 'credit_card');

CREATE TYPE investment_account_type AS ENUM (
  'brokerage', 'histalmut', 'rsu', 'gemel', 'pension'
);

CREATE TYPE policy_type AS ENUM ('health', 'life', 'property', 'vehicle');

CREATE TYPE policy_frequency AS ENUM ('monthly', 'yearly');

CREATE TYPE flow_type AS ENUM ('income', 'expense');

CREATE TYPE flow_frequency AS ENUM ('monthly', 'yearly', 'weekly');

CREATE TYPE portfolio_lot_type AS ENUM ('buy', 'sell', 'rsu_vest', 'dividend_reinvest');

CREATE TYPE category_type AS ENUM ('income', 'expense', 'investment');

CREATE TYPE category_domain AS ENUM (
  'general', 'housing', 'transportation', 'insurances',
  'utilities', 'supermarket', 'hobbies', 'entertainment', 'vacation'
);

CREATE TYPE asset_status AS ENUM ('active', 'sold', 'archived');

CREATE TYPE household_item_category AS ENUM ('appliance', 'furniture', 'electronics', 'other');

CREATE TYPE reminder_type AS ENUM ('maintenance', 'car_test', 'insurance', 'payment_method_change');

-- ── 2. Apply enums to existing text columns ──────────────────────────────────

-- accounts.type  ('checking' → 'bank', 'investment' → 'bank' as fallback)
ALTER TABLE accounts
  ALTER COLUMN type TYPE account_type
  USING CASE type
    WHEN 'bank'        THEN 'bank'::account_type
    WHEN 'credit_card' THEN 'credit_card'::account_type
    WHEN 'checking'    THEN 'bank'::account_type
    ELSE                    'bank'::account_type
  END;

-- investment_accounts.account_type  (gemel_lehashkaa → gemel, other → brokerage)
ALTER TABLE investment_accounts
  ALTER COLUMN account_type TYPE investment_account_type
  USING CASE account_type
    WHEN 'brokerage'       THEN 'brokerage'::investment_account_type
    WHEN 'histalmut'       THEN 'histalmut'::investment_account_type
    WHEN 'rsu'             THEN 'rsu'::investment_account_type
    WHEN 'gemel_lehashkaa' THEN 'gemel'::investment_account_type
    WHEN 'gemel'           THEN 'gemel'::investment_account_type
    WHEN 'pension'         THEN 'pension'::investment_account_type
    ELSE                        'brokerage'::investment_account_type
  END;

-- categories.type
ALTER TABLE categories
  ALTER COLUMN type TYPE category_type USING type::category_type;

-- categories.domain
ALTER TABLE categories
  ALTER COLUMN domain TYPE category_domain USING domain::category_domain;

-- recurring_flows.type
ALTER TABLE recurring_flows
  ALTER COLUMN type TYPE flow_type USING type::flow_type;

-- recurring_flows.frequency
ALTER TABLE recurring_flows
  ALTER COLUMN frequency TYPE flow_frequency USING frequency::flow_frequency;

-- policies.type
ALTER TABLE policies
  ALTER COLUMN type TYPE policy_type USING type::policy_type;

-- policies.premium_frequency
ALTER TABLE policies
  ALTER COLUMN premium_frequency TYPE policy_frequency
  USING premium_frequency::policy_frequency;

ALTER TABLE policies
  ALTER COLUMN premium_frequency SET DEFAULT 'monthly';

-- assets.status
ALTER TABLE assets
  ALTER COLUMN status TYPE asset_status
  USING COALESCE(status::asset_status, 'active'::asset_status);

ALTER TABLE assets
  ALTER COLUMN status SET DEFAULT 'active';

-- household_items.category
ALTER TABLE household_items
  ALTER COLUMN category TYPE household_item_category
  USING CASE
    WHEN category IN ('appliance', 'furniture', 'electronics', 'other')
    THEN category::household_item_category
    ELSE 'other'::household_item_category
  END;

-- portfolio_lots.lot_type
ALTER TABLE portfolio_lots
  ALTER COLUMN lot_type TYPE portfolio_lot_type USING lot_type::portfolio_lot_type;

ALTER TABLE portfolio_lots
  ALTER COLUMN lot_type SET DEFAULT 'buy';

-- reminders.type
ALTER TABLE reminders
  ALTER COLUMN type TYPE reminder_type
  USING CASE
    WHEN type IN ('maintenance', 'car_test', 'insurance', 'payment_method_change')
    THEN type::reminder_type
    ELSE 'maintenance'::reminder_type
  END;

-- ── 3. Column renames ────────────────────────────────────────────────────────

-- investment_accounts: histalmut_eligible_date → tax_eligible_date
ALTER TABLE investment_accounts
  RENAME COLUMN histalmut_eligible_date TO tax_eligible_date;

-- transactions: is_deduplicated → is_duplicate
ALTER TABLE transactions
  RENAME COLUMN is_deduplicated TO is_duplicate;

-- ── 4. Drop redundant column ─────────────────────────────────────────────────

-- recurring_flows.domain is redundant — domain is on the linked category row
ALTER TABLE recurring_flows DROP COLUMN domain;

-- ── 5. Add recurring reminder support ────────────────────────────────────────

ALTER TABLE reminders
  ADD COLUMN is_recurring boolean NOT NULL DEFAULT false,
  ADD COLUMN frequency flow_frequency;

ALTER TABLE reminders
  ADD CONSTRAINT recurring_needs_frequency
  CHECK (is_recurring = false OR frequency IS NOT NULL);

-- ── 6. Check constraints ─────────────────────────────────────────────────────

-- RSU: can't set both shares and percentage for the same cliff/vest event
ALTER TABLE rsu_grants
  ADD CONSTRAINT cliff_vest_one_unit
  CHECK (cliff_vest_shares IS NULL OR cliff_vest_percentage IS NULL);

ALTER TABLE rsu_grants
  ADD CONSTRAINT vest_one_unit
  CHECK (shares_per_vest IS NULL OR vest_percentage IS NULL);

-- Transactions: installment number must not exceed total installments
ALTER TABLE transactions
  ADD CONSTRAINT installment_consistency
  CHECK (installment_number >= 1 AND total_installments >= 1 AND installment_number <= total_installments);
