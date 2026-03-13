-- Add asset_id and policy_id to recurring_flows to support single-entry sync
ALTER TABLE recurring_flows 
ADD COLUMN asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
ADD COLUMN policy_id uuid REFERENCES policies(id) ON DELETE CASCADE;
