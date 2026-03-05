ALTER TABLE recurring_flows
ADD COLUMN start_date date,
ADD COLUMN end_date date,
ADD COLUMN domain text DEFAULT 'general';
