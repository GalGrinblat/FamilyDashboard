-- Add asset_id to transactions table to link expenses directly to tracked assets (e.g., cars, properties)
ALTER TABLE transactions
ADD COLUMN asset_id uuid REFERENCES assets(id) ON DELETE SET NULL;

-- Add a status lifecycle flag to assets to manage archival without outright delete traces.
-- Options: 'active', 'sold', 'archived'
ALTER TABLE assets
ADD COLUMN status text DEFAULT 'active';
