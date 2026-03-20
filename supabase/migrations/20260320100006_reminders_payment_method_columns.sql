ALTER TABLE reminders
  ADD COLUMN recurring_flow_id uuid REFERENCES recurring_flows(id) ON DELETE SET NULL,
  ADD COLUMN target_account_id uuid REFERENCES accounts(id) ON DELETE SET NULL;
