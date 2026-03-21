-- Drop the public-read policy on authorized_users.
-- This policy was a fallback for when SUPABASE_SERVICE_ROLE_KEY was not configured.
-- Now that the service role key is required (see .env.example), the proxy.ts middleware
-- uses the admin client to check authorized users, and no public read is needed.
--
-- PREREQUISITE: Set SUPABASE_SERVICE_ROLE_KEY in your environment before applying this migration.
-- If the service role key is missing, proxy.ts will error rather than fall back to public read.

DROP POLICY IF EXISTS "Public read access to authorized_users" ON authorized_users;
