-- Add metadata column to accounts to store things like billingDate, creditLimit, etc.
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create monthly_overrides table to store local month-specific overrides for recurring flows
CREATE TABLE IF NOT EXISTS monthly_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    recurring_flow_id UUID REFERENCES recurring_flows(id) ON DELETE CASCADE,
    override_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(month_year, recurring_flow_id)
);

-- Enable RLS for the new table
ALTER TABLE monthly_overrides ENABLE ROW LEVEL SECURITY;

-- Note: Proper RLS policies will be added later when authentication is fully implemented.
-- For now, if we are in local dev, disable RLS temporarily or create an open policy for development.
-- (Assuming the project structure currently allows anonymous local access based on previous files)
CREATE POLICY "Enable all actions for anonymous users during dev" 
ON monthly_overrides FOR ALL USING (true) WITH CHECK (true);
