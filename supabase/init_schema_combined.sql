-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- categories Table: For classifying expenses/incomes
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he text NOT NULL, -- Hebrew name of category
  name_en text NOT NULL, -- English name/id
  type text NOT NULL, -- 'income', 'expense', 'investment'
  domain text DEFAULT 'general',
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
  metadata JSONB,
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
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- monthly_overrides table to store local month-specific overrides for recurring flows
CREATE TABLE IF NOT EXISTS monthly_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- merchant_mappings Table: Local cache for AI Engine to auto-classify recurring transactions
CREATE TABLE merchant_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_merchant_string text NOT NULL,
  mapped_category_id uuid REFERENCES categories(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
