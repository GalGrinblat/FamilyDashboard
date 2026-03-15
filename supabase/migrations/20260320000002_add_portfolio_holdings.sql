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
