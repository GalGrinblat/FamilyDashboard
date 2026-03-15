-- Enable RLS and create authenticated-access policies for all new investment tables
-- Matches the pattern established in 20260309194000_secure_rls_perimeter.sql

ALTER TABLE investment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsu_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsu_vests ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated access" ON investment_accounts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON portfolio_holdings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON portfolio_lots FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON rsu_grants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON rsu_vests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON portfolio_snapshots FOR ALL USING (auth.role() = 'authenticated');
