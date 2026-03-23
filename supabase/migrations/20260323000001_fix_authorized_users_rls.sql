-- The public read policy on authorized_users was dropped in 20260321000001,
-- but every other table's RLS policy uses:
--   auth.email() IN (SELECT email FROM authorized_users)
-- Without a SELECT policy, that subquery always returns empty, blocking all access.
-- Restore read access for authenticated users only (not public).
CREATE POLICY "authenticated_can_read" ON authorized_users
  FOR SELECT TO authenticated USING (true);
