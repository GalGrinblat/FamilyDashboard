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
  amount numeric(12,2) NOT NULL,
  date date NOT NULL,
  description text,
  merchant text, -- Used for AI classification
  is_deduplicated boolean DEFAULT false,
  -- Tashlumim (Installments) handling
  original_amount numeric(12,2),
  installment_number integer DEFAULT 1,
  total_installments integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- assets Table: Real estate, Cars, and other tracked investments
CREATE TABLE assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL, -- 'real_estate', 'vehicle', 'stock'
  estimated_value numeric(12,2),
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
