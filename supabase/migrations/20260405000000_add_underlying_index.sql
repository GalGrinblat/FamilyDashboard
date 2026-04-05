-- Add underlying index for ETF portfolio holdings
ALTER TABLE portfolio_holdings ADD COLUMN IF NOT EXISTS underlying_index text;
