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
