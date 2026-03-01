-- Schema Update: Add 'domain' to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS domain text DEFAULT 'general';

-- Optional: Update any existing null domains to 'general' just in case
UPDATE categories SET domain = 'general' WHERE domain IS NULL;
