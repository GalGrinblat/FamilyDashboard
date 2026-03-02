ALTER TABLE reminders
ADD COLUMN asset_id uuid REFERENCES assets(id) ON DELETE CASCADE;
