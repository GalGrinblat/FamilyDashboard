-- ==========================================
-- Family Dashboard Consolidated Schema
-- ==========================================
-- This file represents the complete, final state of the database schema.

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tables

-- authorized_users: Perimeter security list
CREATE TABLE authorized_users (
  email text PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now()
);

-- categories: For classifying expenses/incomes
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he text NOT NULL,
  name_en text NOT NULL,
  type text NOT NULL, -- 'income', 'expense', 'investment'
  parent_id uuid REFERENCES categories(id),
  sort_order integer NOT NULL DEFAULT 0,
  domain text NOT NULL DEFAULT 'general',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- accounts: Bank accounts, credit cards, investment portfolios
CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL, -- 'checking', 'credit_card', 'investment', etc
  currency text NOT NULL DEFAULT 'ILS',
  current_balance numeric(12,2) NOT NULL DEFAULT 0,
  metadata jsonb, -- billingDate, creditLimit, etc.
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- trips: For aggregating vacation expenses
CREATE TABLE trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date,
  end_date date,
  budget numeric(12,2),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- assets: Real estate, Vehicles, Stock
CREATE TABLE assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL, -- 'real_estate', 'vehicle', 'stock'
  estimated_value numeric(12,2),
  status text DEFAULT 'active', -- 'active', 'sold', 'archived'
  metadata jsonb,
  attachments jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- transactions: Core ledger
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id),
  category_id uuid REFERENCES categories(id),
  trip_id uuid REFERENCES trips(id),
  recurring_flow_id uuid,
  asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL,
  date date NOT NULL,
  description text,
  merchant text,
  is_deduplicated boolean NOT NULL DEFAULT false,
  original_amount numeric(12,2),
  installment_number integer NOT NULL DEFAULT 1,
  total_installments integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- household_items: Inventory
CREATE TABLE household_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  purchase_date date,
  purchase_price numeric(12,2),
  warranty_expiry date,
  metadata jsonb,
  attachments jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- reminders: Alerts
CREATE TABLE reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  start_date date,
  due_date date NOT NULL,
  type text NOT NULL, -- 'insurance', 'car_test', 'maintenance'
  is_completed boolean NOT NULL DEFAULT false,
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- recurring_flows: "Expected vs Actual" budgeting
CREATE TABLE recurring_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(id),
  name text NOT NULL,
  amount numeric(12,2) NOT NULL,
  type text NOT NULL, -- 'income' or 'expense'
  frequency text NOT NULL, -- 'monthly', 'yearly', 'weekly'
  start_date date,
  end_date date,
  domain text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  policy_id uuid REFERENCES policies(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- monthly_overrides: Local month-specific adjustments
CREATE TABLE monthly_overrides (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    month_year varchar(7) NOT NULL, -- YYYY-MM
    recurring_flow_id uuid REFERENCES recurring_flows(id) ON DELETE CASCADE,
    override_amount numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(month_year, recurring_flow_id)
);

-- merchant_mappings: AI Auto-classification cache
CREATE TABLE merchant_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_merchant_string text NOT NULL,
  mapped_category_id uuid REFERENCES categories(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- policies: Insurance Policies
CREATE TABLE policies (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    policy_number text,
    type text NOT NULL, -- Converted from enum to text
    subtype text,
    provider text NOT NULL,
    premium_amount numeric NOT NULL,
    premium_frequency text NOT NULL DEFAULT 'monthly', -- Converted from enum to text
    renewal_date date,
    covered_individuals text[],
    asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
    document_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Security (RLS)

-- Enable RLS on all tables
ALTER TABLE authorized_users ENABLE ROW LEVEL SECURITY;
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

-- Perimeter Policies: Authenticated users have full access
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

-- Public policy for perimeter check
CREATE POLICY "Public read access to authorized_users" ON authorized_users FOR SELECT USING (true);

-- 3. Storage

-- Setup Storage for Insurance Documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('policies_documents', 'policies_documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'policies_documents' );
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'policies_documents' );
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING ( bucket_id = 'policies_documents' );
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'policies_documents' );
