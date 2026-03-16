-- Drop fmv_at_vest: Section 102 only → cost basis = grant price on portfolio_lots.
-- No income-track support for now, so FMV at vest is unused.
ALTER TABLE rsu_vests DROP COLUMN IF EXISTS fmv_at_vest;

-- Add vesting % and cliff-override fields to rsu_grants
ALTER TABLE rsu_grants
  ADD COLUMN IF NOT EXISTS vest_percentage numeric(8,4),
  ADD COLUMN IF NOT EXISTS cliff_vest_shares numeric(15,4),
  ADD COLUMN IF NOT EXISTS cliff_vest_percentage numeric(8,4);
