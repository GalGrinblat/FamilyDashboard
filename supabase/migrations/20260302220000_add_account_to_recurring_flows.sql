ALTER TABLE recurring_flows
ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;
