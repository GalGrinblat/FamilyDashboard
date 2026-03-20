-- Phase 1: Replace JSONB columns with explicit typed columns
-- accounts.metadata → billing_day + credit_limit
-- household_items.metadata → serial_number + model + manual_url
-- household_items.attachments → attachment_urls text[]

-- ── accounts ─────────────────────────────────────────────────────────────────

ALTER TABLE accounts
  ADD COLUMN billing_day integer,
  ADD COLUMN credit_limit numeric(12,2);

-- Migrate existing metadata values
UPDATE accounts
SET
  billing_day  = (metadata->>'billingDate')::integer,
  credit_limit = (metadata->>'creditLimit')::numeric
WHERE metadata IS NOT NULL;

-- Constraint: billing_day must be a valid day of month
ALTER TABLE accounts
  ADD CONSTRAINT billing_day_range CHECK (billing_day IS NULL OR (billing_day >= 1 AND billing_day <= 31));

-- Drop the old JSONB column
ALTER TABLE accounts DROP COLUMN metadata;

-- ── household_items ───────────────────────────────────────────────────────────

ALTER TABLE household_items
  ADD COLUMN serial_number text,
  ADD COLUMN model text,
  ADD COLUMN manual_url text,
  ADD COLUMN attachment_urls text[];

-- Migrate existing metadata values
UPDATE household_items
SET
  serial_number = metadata->>'serialNumber',
  model         = metadata->>'model',
  manual_url    = metadata->>'manualUrl'
WHERE metadata IS NOT NULL;

-- Drop old JSONB columns
ALTER TABLE household_items DROP COLUMN metadata;
ALTER TABLE household_items DROP COLUMN attachments;
