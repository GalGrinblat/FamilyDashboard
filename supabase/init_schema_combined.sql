-- ==========================================
-- THIS FILE IS AUTO-GENERATED - DO NOT EDIT
-- ==========================================
-- It concatenates all migrations into a single file for easy reading and initialization.

-- ==========================================
-- Migration: 20260222000000_init_schema.sql
-- ==========================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- categories Table: For classifying expenses/incomes
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he text NOT NULL, -- Hebrew name of category
  name_en text NOT NULL, -- English name/id
  type text NOT NULL, -- 'income', 'expense', 'investment'
  parent_id uuid REFERENCES categories(id), -- for sub-categories
  sort_order integer DEFAULT 0, -- Allows manual ordering of categories
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- accounts Table: Bank accounts, credit cards, investment portfolios
CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL, -- 'checking', 'credit_card', 'investment', etc
  currency text DEFAULT 'ILS',
  current_balance numeric(12,2) DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- trips Table: For aggregating vacation expenses
CREATE TABLE trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, -- e.g. "Kitzbühel 2026"
  start_date date,
  end_date date,
  budget numeric(12,2),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- transactions Table: Core ledger for all incomes and expenses
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES accounts(id),
  category_id uuid REFERENCES categories(id),
  trip_id uuid REFERENCES trips(id), -- Links specific expenses to vacations
  recurring_flow_id uuid, -- Linking expected with actual transactions 
  amount numeric(12,2) NOT NULL,
  date date NOT NULL,
  description text,
  merchant text, -- Used for AI classification
  is_deduplicated boolean DEFAULT false,
  -- Tashlumim (Installments) handling
  original_amount numeric(12,2),
  installment_number integer DEFAULT 1,
  total_installments integer DEFAULT 1,
  asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- assets Table: Real estate, Cars, and other tracked investments
CREATE TABLE assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL, -- 'real_estate', 'vehicle', 'stock'
  estimated_value numeric(12,2),
  status text DEFAULT 'active',
  metadata jsonb, -- Stores specific info like license plates, stock tickers, etc.
  attachments jsonb, -- Array of Supabase Storage file paths (receipts, docs)
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- household_items Table: Inventory for appliances, electronics, furniture (does not appreciate in value like an asset)
CREATE TABLE household_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL, -- 'appliance', 'furniture', 'electronics'
  purchase_date date,
  purchase_price numeric(12,2),
  warranty_expiry date,
  metadata jsonb, -- serial number, model, manual URL
  attachments jsonb, -- Array of Supabase Storage file paths (receipts, warranty docs)
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- reminders Table: For alerts (car tests, insurances)
CREATE TABLE reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  due_date date NOT NULL,
  type text NOT NULL, -- 'insurance', 'car_test', 'maintenance'
  is_completed boolean DEFAULT false,
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- recurring_flows Table: "Expected vs Actual" architecture for budgeting salaries, rents, etc.
CREATE TABLE recurring_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, -- e.g. 'Gal Salary', 'Apartment Rent'
  amount numeric(12,2) NOT NULL, -- Expected amount
  type text NOT NULL, -- 'income' or 'expense'
  category_id uuid REFERENCES categories(id),
  frequency text NOT NULL, -- 'monthly', 'yearly', 'weekly'
  next_date date, -- Date of next expected occurrence
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- merchant_mappings Table: Local cache for AI Engine to auto-classify recurring transactions
CREATE TABLE merchant_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_merchant_string text NOT NULL,
  mapped_category_id uuid REFERENCES categories(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- Migration: 20260301074023_add_category_domain.sql
-- ==========================================

-- Schema Update: Add 'domain' to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS domain text DEFAULT 'general';

-- Optional: Update any existing null domains to 'general' just in case
UPDATE categories SET domain = 'general' WHERE domain IS NULL;

-- ==========================================
-- Migration: 20260302162500_link_reminders_to_assets.sql
-- ==========================================

ALTER TABLE reminders
ADD COLUMN asset_id uuid REFERENCES assets(id) ON DELETE CASCADE;

-- ==========================================
-- Migration: 20260302165000_asset_transaction_linking.sql
-- ==========================================

-- Add asset_id to transactions table to link expenses directly to tracked assets (e.g., cars, properties)
ALTER TABLE transactions
ADD COLUMN asset_id uuid REFERENCES assets(id) ON DELETE SET NULL;

-- Add a status lifecycle flag to assets to manage archival without outright delete traces.
-- Options: 'active', 'sold', 'archived'
ALTER TABLE assets
ADD COLUMN status text DEFAULT 'active';

-- ==========================================
-- Migration: 20260302210000_monthly_balance_schema.sql
-- ==========================================

-- Add metadata column to accounts to store things like billingDate, creditLimit, etc.
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create monthly_overrides table to store local month-specific overrides for recurring flows
CREATE TABLE IF NOT EXISTS monthly_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    recurring_flow_id UUID REFERENCES recurring_flows(id) ON DELETE CASCADE,
    override_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(month_year, recurring_flow_id)
);

-- Enable RLS for the new table
ALTER TABLE monthly_overrides ENABLE ROW LEVEL SECURITY;

-- Note: Proper RLS policies will be added later when authentication is fully implemented.
-- For now, if we are in local dev, disable RLS temporarily or create an open policy for development.
-- (Assuming the project structure currently allows anonymous local access based on previous files)
CREATE POLICY "Enable all actions for anonymous users during dev" 
ON monthly_overrides FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- Migration: 20260302220000_add_account_to_recurring_flows.sql
-- ==========================================

ALTER TABLE recurring_flows
ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;

-- ==========================================
-- Migration: 20260305224100_recurring_flows_enhancements.sql
-- ==========================================

ALTER TABLE recurring_flows
ADD COLUMN start_date date,
ADD COLUMN end_date date,
ADD COLUMN domain text DEFAULT 'general';

-- ==========================================
-- Migration: 20260305224900_drop_next_date.sql
-- ==========================================

ALTER TABLE recurring_flows
DROP COLUMN next_date;

-- ==========================================
-- Migration: 20260306093500_add_policies_table.sql
-- ==========================================

-- Add Policies Table
create type policy_type as enum ('health', 'life', 'property', 'vehicle');
create type policy_frequency as enum ('monthly', 'yearly');

create table public.policies (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    name text not null,
    policy_number text,
    type policy_type not null,
    provider text not null,
    
    premium_amount numeric not null,
    premium_frequency policy_frequency not null default 'monthly',
    renewal_date date,
    
    covered_individuals text[],
    asset_id uuid references public.assets(id) on delete set null,
    document_url text
);

-- RLS Policies
alter table public.policies enable row level security;

create policy "Enable read access for all users" on public.policies
    for select using (true);

create policy "Enable insert access for all users" on public.policies
    for insert with check (true);

create policy "Enable update access for all users" on public.policies
    for update using (true);

create policy "Enable delete access for all users" on public.policies
    for delete using (true);
    
-- Set up Storage for Insurance Documents
insert into storage.buckets (id, name, public) 
values ('policies_documents', 'policies_documents', true)
on conflict (id) do nothing;

create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'policies_documents' );

create policy "Public Insert"
on storage.objects for insert
with check ( bucket_id = 'policies_documents' );

create policy "Public Update"
on storage.objects for update
using ( bucket_id = 'policies_documents' );

create policy "Public Delete"
on storage.objects for delete
using ( bucket_id = 'policies_documents' );

-- ==========================================
-- Migration: 20260309194000_secure_rls_perimeter.sql
-- ==========================================

-- Migration to secure the database using a simple perimeter security model
-- 1. Create the authorized_users table
CREATE TABLE authorized_users (
  email text PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Allow public access to authorized_users so the middleware/auth can check it if needed
-- Alternatively, we can check it via a secure server context
CREATE POLICY "Public read access to authorized_users" ON authorized_users FOR SELECT USING (true);


-- 3. Enable RLS on all existing tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- 4. Drop any insecure policies that might have been created before
-- Attempt to drop the local dev policy we saw earlier, IF it exists.
DO $$ 
BEGIN
  IF EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'transactions' 
      AND policyname = 'Enable all actions for anonymous users during dev'
  ) THEN
      DROP POLICY "Enable all actions for anonymous users during dev" ON transactions;
      DROP POLICY "Enable all actions for anonymous users during dev" ON accounts;
      DROP POLICY "Enable all actions for anonymous users during dev" ON categories;
      DROP POLICY "Enable all actions for anonymous users during dev" ON recurring_flows;
      DROP POLICY "Enable all actions for anonymous users during dev" ON monthly_overrides;
  END IF;
END $$;


-- 5. Create generic RLS policies allowing ANY authenticated user full access
-- We are trusting the perimeter (login/middleware) to only let authorized people become "authenticated"
CREATE POLICY "Allow authenticated access" ON accounts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON assets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON household_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON merchant_mappings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON monthly_overrides FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON policies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON recurring_flows FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON reminders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON trips FOR ALL USING (auth.role() = 'authenticated');

-- Need to make sure policies table doesn't have overlapping public policies from previous migrations
DROP POLICY IF EXISTS "Enable read access for all users" ON policies;
DROP POLICY IF EXISTS "Enable insert access for all users" ON policies;
DROP POLICY IF EXISTS "Enable update access for all users" ON policies;
DROP POLICY IF EXISTS "Enable delete access for all users" ON policies;
DROP POLICY IF EXISTS "Public Access" ON policies;
DROP POLICY IF EXISTS "Public Insert" ON policies;
DROP POLICY IF EXISTS "Public Update" ON policies;
DROP POLICY IF EXISTS "Public Delete" ON policies;

-- ==========================================
-- Migration: 20260309202900_enable_rls_authorized_users.sql
-- ==========================================

-- Enable RLS on authorized_users to ensure the public read policy actually takes effect properly
ALTER TABLE authorized_users ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- Migration: 20260311000000_add_reminder_start_date.sql
-- ==========================================

-- Add start_date to reminders table
ALTER TABLE public.reminders ADD COLUMN start_date date;

-- ==========================================
-- Migration: 20260311000001_add_policy_subtype.sql
-- ==========================================

-- Migration to add subtype to policies table
ALTER TABLE public.policies ADD COLUMN subtype text;

-- ==========================================
-- Migration: 20260311000002_remove_policies_enums.sql
-- ==========================================

-- Schema Update: Convert enums to text in policies table
ALTER TABLE public.policies
  ALTER COLUMN type SET DATA TYPE text USING type::text,
  ALTER COLUMN premium_frequency SET DATA TYPE text USING premium_frequency::text,
  ALTER COLUMN premium_frequency SET DEFAULT 'monthly';

-- Drop the unused enum types
DROP TYPE IF EXISTS public.policy_type CASCADE;
DROP TYPE IF EXISTS public.policy_frequency CASCADE;

-- ==========================================
-- Migration: 20260313224000_link_recurring_flows_to_assets_and_policies.sql
-- ==========================================

-- Add asset_id and policy_id to recurring_flows to support single-entry sync
ALTER TABLE recurring_flows 
ADD COLUMN asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
ADD COLUMN policy_id uuid REFERENCES policies(id) ON DELETE CASCADE;

-- ==========================================
-- Migration: 20260320000001_add_investment_accounts.sql
-- ==========================================

-- Investment accounts table
-- Separate from generic 'accounts' table: needs subtypes, fees, and tax-specific fields

CREATE TABLE investment_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  account_type text NOT NULL, -- 'brokerage' | 'gemel_lehashkaa' | 'histalmut' | 'rsu' | 'other'
  broker text,                -- e.g. 'IBI', 'Interactive Brokers', 'Meitav'
  management_fee_percent numeric(6,4), -- e.g. 0.5000 = 0.5%
  -- Self-directed (IRA) vs managed fund:
  is_managed boolean NOT NULL DEFAULT false, -- true = fund house manages, track balance only
  current_balance numeric(15,2),             -- used only when is_managed = true
  -- Histalmut-specific tax fields:
  histalmut_eligible_date date,              -- 6-year mark; gains before = 25%, gains after = partial
  monthly_contribution_ils numeric(10,2),    -- total monthly contribution (employer + employee)
                                              -- ceiling = 1571 NIS; above_fraction = max(0, monthly-1571)/monthly
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- Migration: 20260320000002_add_portfolio_holdings.sql
-- ==========================================

-- Portfolio holdings: one row per ticker per investment account
-- Only relevant for self-directed (is_managed = false) accounts

CREATE TABLE portfolio_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_account_id uuid NOT NULL REFERENCES investment_accounts(id) ON DELETE CASCADE,
  ticker text NOT NULL,     -- e.g. 'AAPL', 'TEVA.TA', 'BTC-USD'
  asset_class text NOT NULL DEFAULT 'stock', -- 'stock' | 'etf' | 'crypto' | 'bond' | 'fund' | 'other'
  name text,                -- e.g. 'Apple Inc.', 'Teva Pharmaceutical'
  currency text NOT NULL DEFAULT 'USD', -- price currency: 'USD' | 'ILS'
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(investment_account_id, ticker)
);

-- ==========================================
-- Migration: 20260320000003_add_portfolio_lots.sql
-- ==========================================

-- Portfolio lots: individual buy/sell/vest events per holding
-- Enables accurate cost basis, P&L per lot, and lot-level tax calculations

CREATE TABLE portfolio_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  holding_id uuid NOT NULL REFERENCES portfolio_holdings(id) ON DELETE CASCADE,
  lot_type text NOT NULL DEFAULT 'buy', -- 'buy' | 'sell' | 'rsu_vest' | 'dividend_reinvest'
  purchase_date date NOT NULL,
  quantity numeric(18,8) NOT NULL,        -- supports fractional shares and crypto
  price_per_unit numeric(18,6) NOT NULL,  -- in holding's currency
  total_cost numeric(15,2),              -- computed: quantity * price_per_unit + fees
  fees numeric(10,2) DEFAULT 0,
  related_lot_id uuid REFERENCES portfolio_lots(id) ON DELETE SET NULL, -- for sells: points to buy lot
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- Migration: 20260320000004_add_rsu_tables.sql
-- ==========================================

-- RSU grants and vest events
-- Section 102 (capital gains track): no tax at vest; tax only at sale
--   - At sale: income tax on (grant_price * shares) + capital gains or marginal on gain
--   - 2-year holding period from grant date determines gain tax rate (25% vs marginal ~47%)

CREATE TABLE rsu_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_account_id uuid NOT NULL REFERENCES investment_accounts(id) ON DELETE CASCADE,
  ticker text NOT NULL,              -- e.g. 'GOOGL', 'MSFT'
  employer text,                     -- e.g. 'Google LLC'
  grant_date date NOT NULL,
  total_shares numeric(15,4) NOT NULL,
  grant_price_usd numeric(15,6),     -- FMV per share at grant date (USD)
  cliff_months integer DEFAULT 12,   -- months before first vest
  vest_frequency_months integer DEFAULT 3, -- how often shares vest (1=monthly, 3=quarterly, 12=annual)
  shares_per_vest numeric(15,4),     -- typical quantity per vest event
  tax_track text NOT NULL DEFAULT 'capital_gains', -- 'capital_gains' (Section 102) | 'income'
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE rsu_vests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id uuid NOT NULL REFERENCES rsu_grants(id) ON DELETE CASCADE,
  vest_date date NOT NULL,
  shares_vested numeric(15,4) NOT NULL,
  fmv_at_vest numeric(15,6) NOT NULL,  -- FMV per share at vest date (USD) — for reference only
  -- No tax fields: Section 102 tax crystallizes only at sale, not at vest
  -- linked_lot_id: points to the portfolio_lots entry created for these vested shares
  linked_lot_id uuid REFERENCES portfolio_lots(id) ON DELETE SET NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- Migration: 20260320000005_add_portfolio_snapshots.sql
-- ==========================================

-- Daily portfolio value snapshots per investment account
-- Powers time-series performance charts (1M / 3M / 1Y / ALL)
-- Written by POST /api/portfolio/snapshot on page load

CREATE TABLE portfolio_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_account_id uuid NOT NULL REFERENCES investment_accounts(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  total_value_ils numeric(15,2) NOT NULL,   -- total account value converted to ILS
  total_cost_basis_ils numeric(15,2),       -- total cost basis in ILS
  unrealized_gain_ils numeric(15,2),        -- total_value_ils - total_cost_basis_ils
  usd_ils_rate numeric(10,6),               -- USD/ILS exchange rate used for conversion
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(investment_account_id, snapshot_date)
);

-- ==========================================
-- Migration: 20260320000006_rls_investment_tables.sql
-- ==========================================

-- Enable RLS and create authenticated-access policies for all new investment tables
-- Matches the pattern established in 20260309194000_secure_rls_perimeter.sql

ALTER TABLE investment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsu_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsu_vests ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated access" ON investment_accounts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON portfolio_holdings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON portfolio_lots FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON rsu_grants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON rsu_vests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON portfolio_snapshots FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- Migration: 20260320000007_rsu_improvements.sql
-- ==========================================

-- Drop fmv_at_vest: Section 102 only → cost basis = grant price on portfolio_lots.
-- No income-track support for now, so FMV at vest is unused.
ALTER TABLE rsu_vests DROP COLUMN IF EXISTS fmv_at_vest;

-- Add vesting % and cliff-override fields to rsu_grants
ALTER TABLE rsu_grants
  ADD COLUMN IF NOT EXISTS vest_percentage numeric(8,4),
  ADD COLUMN IF NOT EXISTS cliff_vest_shares numeric(15,4),
  ADD COLUMN IF NOT EXISTS cliff_vest_percentage numeric(8,4);

-- ==========================================
-- Migration: 20260320100001_add_enums_and_cleanup.sql
-- ==========================================

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

-- ==========================================
-- Migration: 20260320100002_harden_rls.sql
-- ==========================================

-- Phase 1: Strengthen RLS policies
-- Replace auth.role() = 'authenticated' with authorized_users email check.
-- This ensures that only whitelisted users can access data — not merely any
-- Supabase-authenticated user who bypasses the Next.js auth layer.

-- ── Drop old permissive policies ─────────────────────────────────────────────

DROP POLICY IF EXISTS "Allow authenticated access" ON accounts;
DROP POLICY IF EXISTS "Allow authenticated access" ON assets;
DROP POLICY IF EXISTS "Allow authenticated access" ON categories;
DROP POLICY IF EXISTS "Allow authenticated access" ON household_items;
DROP POLICY IF EXISTS "Allow authenticated access" ON merchant_mappings;
DROP POLICY IF EXISTS "Allow authenticated access" ON monthly_overrides;
DROP POLICY IF EXISTS "Allow authenticated access" ON policies;
DROP POLICY IF EXISTS "Allow authenticated access" ON recurring_flows;
DROP POLICY IF EXISTS "Allow authenticated access" ON reminders;
DROP POLICY IF EXISTS "Allow authenticated access" ON transactions;
DROP POLICY IF EXISTS "Allow authenticated access" ON trips;

-- Also drop any leftover dev policies
DROP POLICY IF EXISTS "Enable all actions for anonymous users during dev" ON monthly_overrides;

-- Investment tables (added in later migrations)
DROP POLICY IF EXISTS "Allow authenticated access" ON investment_accounts;
DROP POLICY IF EXISTS "Allow authenticated access" ON portfolio_holdings;
DROP POLICY IF EXISTS "Allow authenticated access" ON portfolio_lots;
DROP POLICY IF EXISTS "Allow authenticated access" ON portfolio_snapshots;
DROP POLICY IF EXISTS "Allow authenticated access" ON rsu_grants;
DROP POLICY IF EXISTS "Allow authenticated access" ON rsu_vests;

-- ── Create hardened policies ──────────────────────────────────────────────────

CREATE POLICY "authorized_only" ON accounts
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON assets
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON categories
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON household_items
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON merchant_mappings
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON monthly_overrides
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON policies
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON recurring_flows
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON reminders
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON transactions
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON trips
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON investment_accounts
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON portfolio_holdings
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON portfolio_lots
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON portfolio_snapshots
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON rsu_grants
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON rsu_vests
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

-- ==========================================
-- Migration: 20260320100003_financial_goals.sql
-- ==========================================

-- Phase 1: Add financial_goals table for the Planning domain

CREATE TYPE goal_category AS ENUM (
  'emergency_fund', 'down_payment', 'vacation', 'education', 'other'
);

CREATE TABLE financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  target_amount numeric(12,2) NOT NULL,
  current_amount numeric(12,2) NOT NULL DEFAULT 0,
  target_date date,
  category goal_category NOT NULL DEFAULT 'other',
  notes text,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authorized_only" ON financial_goals
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

-- ==========================================
-- Migration: 20260320100004_replace_jsonb_columns.sql
-- ==========================================

-- Phase 1: Replace JSONB columns with explicit typed columns
-- accounts.metadata → billing_day + credit_limit
-- household_items.metadata → serial_number + model + manual_url
-- household_items.attachments → attachment_urls text[]

-- ── accounts ─────────────────────────────────────────────────────────────────

ALTER TABLE accounts
  ADD COLUMN billing_day integer,
  ADD COLUMN credit_limit numeric(12,2);

-- Migrate existing metadata values
UPDATE accounts
SET
  billing_day  = (metadata->>'billingDate')::integer,
  credit_limit = (metadata->>'creditLimit')::numeric
WHERE metadata IS NOT NULL;

-- Constraint: billing_day must be a valid day of month
ALTER TABLE accounts
  ADD CONSTRAINT billing_day_range CHECK (billing_day IS NULL OR (billing_day >= 1 AND billing_day <= 31));

-- Drop the old JSONB column
ALTER TABLE accounts DROP COLUMN metadata;

-- ── household_items ───────────────────────────────────────────────────────────

ALTER TABLE household_items
  ADD COLUMN serial_number text,
  ADD COLUMN model text,
  ADD COLUMN manual_url text,
  ADD COLUMN attachment_urls text[];

-- Migrate existing metadata values
UPDATE household_items
SET
  serial_number = metadata->>'serialNumber',
  model         = metadata->>'model',
  manual_url    = metadata->>'manualUrl'
WHERE metadata IS NOT NULL;

-- Drop old JSONB columns
ALTER TABLE household_items DROP COLUMN metadata;
ALTER TABLE household_items DROP COLUMN attachments;

-- ==========================================
-- Migration: 20260320100005_add_monthly_one_offs.sql
-- ==========================================

CREATE TABLE monthly_one_offs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year varchar(7) NOT NULL,
  title text NOT NULL,
  amount numeric(12,2) NOT NULL,
  type flow_type NOT NULL,
  day_of_month integer NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE monthly_one_offs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authorized_only" ON monthly_one_offs
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

-- ==========================================
-- Migration: 20260320100006_reminders_payment_method_columns.sql
-- ==========================================

ALTER TABLE reminders
  ADD COLUMN recurring_flow_id uuid REFERENCES recurring_flows(id) ON DELETE SET NULL,
  ADD COLUMN target_account_id uuid REFERENCES accounts(id) ON DELETE SET NULL;

-- ==========================================
-- Migration: 20260321000001_drop_authorized_users_public_read.sql
-- ==========================================

-- Drop the public-read policy on authorized_users.
-- This policy was a fallback for when SUPABASE_SERVICE_ROLE_KEY was not configured.
-- Now that the service role key is required (see .env.example), the proxy.ts middleware
-- uses the admin client to check authorized users, and no public read is needed.
--
-- PREREQUISITE: Set SUPABASE_SERVICE_ROLE_KEY in your environment before applying this migration.
-- If the service role key is missing, proxy.ts will error rather than fall back to public read.

DROP POLICY IF EXISTS "Public read access to authorized_users" ON authorized_users;

-- ==========================================
-- Migration: 20260323000001_fix_authorized_users_rls.sql
-- ==========================================

-- The public read policy on authorized_users was dropped in 20260321000001,
-- but every other table's RLS policy uses:
--   auth.email() IN (SELECT email FROM authorized_users)
-- Without a SELECT policy, that subquery always returns empty, blocking all access.
-- Restore read access for authenticated users only (not public).
CREATE POLICY "authenticated_can_read" ON authorized_users
  FOR SELECT TO authenticated USING (true);

