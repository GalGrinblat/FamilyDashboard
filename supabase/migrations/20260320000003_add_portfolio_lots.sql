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
