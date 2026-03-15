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
