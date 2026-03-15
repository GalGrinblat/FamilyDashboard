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
