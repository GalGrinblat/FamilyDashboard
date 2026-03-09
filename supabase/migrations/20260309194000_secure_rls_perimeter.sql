-- Migration to secure the database using a simple perimeter security model
-- 1. Create the authorized_users table
CREATE TABLE authorized_users (
  email text PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Allow public access to authorized_users so the middleware/auth can check it if needed
-- Alternatively, we can check it via a secure server context
CREATE POLICY "Public read access to authorized_users" ON authorized_users FOR SELECT USING (true);


-- 3. Enable RLS on all existing tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- 4. Drop any insecure policies that might have been created before
-- Attempt to drop the local dev policy we saw earlier, IF it exists.
DO $$ 
BEGIN
  IF EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'transactions' 
      AND policyname = 'Enable all actions for anonymous users during dev'
  ) THEN
      DROP POLICY "Enable all actions for anonymous users during dev" ON transactions;
      DROP POLICY "Enable all actions for anonymous users during dev" ON accounts;
      DROP POLICY "Enable all actions for anonymous users during dev" ON categories;
      DROP POLICY "Enable all actions for anonymous users during dev" ON recurring_flows;
      DROP POLICY "Enable all actions for anonymous users during dev" ON monthly_overrides;
  END IF;
END $$;


-- 5. Create generic RLS policies allowing ANY authenticated user full access
-- We are trusting the perimeter (login/middleware) to only let authorized people become "authenticated"
CREATE POLICY "Allow authenticated access" ON accounts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON assets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON household_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON merchant_mappings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON monthly_overrides FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON policies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON recurring_flows FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON reminders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated access" ON trips FOR ALL USING (auth.role() = 'authenticated');

-- Need to make sure policies table doesn't have overlapping public policies from previous migrations
DROP POLICY IF EXISTS "Enable read access for all users" ON policies;
DROP POLICY IF EXISTS "Enable insert access for all users" ON policies;
DROP POLICY IF EXISTS "Enable update access for all users" ON policies;
DROP POLICY IF EXISTS "Enable delete access for all users" ON policies;
DROP POLICY IF EXISTS "Public Access" ON policies;
DROP POLICY IF EXISTS "Public Insert" ON policies;
DROP POLICY IF EXISTS "Public Update" ON policies;
DROP POLICY IF EXISTS "Public Delete" ON policies;
