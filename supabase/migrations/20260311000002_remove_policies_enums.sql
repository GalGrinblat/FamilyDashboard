-- Schema Update: Convert enums to text in policies table
ALTER TABLE public.policies
  ALTER COLUMN type SET DATA TYPE text USING type::text,
  ALTER COLUMN premium_frequency SET DATA TYPE text USING premium_frequency::text,
  ALTER COLUMN premium_frequency SET DEFAULT 'monthly';

-- Drop the unused enum types
DROP TYPE IF EXISTS public.policy_type CASCADE;
DROP TYPE IF EXISTS public.policy_frequency CASCADE;
