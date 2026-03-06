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

