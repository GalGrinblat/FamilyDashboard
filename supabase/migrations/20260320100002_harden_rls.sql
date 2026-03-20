-- Phase 1: Strengthen RLS policies
-- Replace auth.role() = 'authenticated' with authorized_users email check.
-- This ensures that only whitelisted users can access data — not merely any
-- Supabase-authenticated user who bypasses the Next.js auth layer.

-- ── Drop old permissive policies ─────────────────────────────────────────────

DROP POLICY IF EXISTS "Allow authenticated access" ON accounts;
DROP POLICY IF EXISTS "Allow authenticated access" ON assets;
DROP POLICY IF EXISTS "Allow authenticated access" ON categories;
DROP POLICY IF EXISTS "Allow authenticated access" ON household_items;
DROP POLICY IF EXISTS "Allow authenticated access" ON merchant_mappings;
DROP POLICY IF EXISTS "Allow authenticated access" ON monthly_overrides;
DROP POLICY IF EXISTS "Allow authenticated access" ON policies;
DROP POLICY IF EXISTS "Allow authenticated access" ON recurring_flows;
DROP POLICY IF EXISTS "Allow authenticated access" ON reminders;
DROP POLICY IF EXISTS "Allow authenticated access" ON transactions;
DROP POLICY IF EXISTS "Allow authenticated access" ON trips;

-- Also drop any leftover dev policies
DROP POLICY IF EXISTS "Enable all actions for anonymous users during dev" ON monthly_overrides;

-- Investment tables (added in later migrations)
DROP POLICY IF EXISTS "Allow authenticated access" ON investment_accounts;
DROP POLICY IF EXISTS "Allow authenticated access" ON portfolio_holdings;
DROP POLICY IF EXISTS "Allow authenticated access" ON portfolio_lots;
DROP POLICY IF EXISTS "Allow authenticated access" ON portfolio_snapshots;
DROP POLICY IF EXISTS "Allow authenticated access" ON rsu_grants;
DROP POLICY IF EXISTS "Allow authenticated access" ON rsu_vests;

-- ── Create hardened policies ──────────────────────────────────────────────────

CREATE POLICY "authorized_only" ON accounts
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON assets
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON categories
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON household_items
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON merchant_mappings
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON monthly_overrides
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON policies
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON recurring_flows
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON reminders
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON transactions
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON trips
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON investment_accounts
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON portfolio_holdings
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON portfolio_lots
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON portfolio_snapshots
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON rsu_grants
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));

CREATE POLICY "authorized_only" ON rsu_vests
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));
