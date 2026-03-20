-- Phase 1: Add financial_goals table for the Planning domain

CREATE TYPE goal_category AS ENUM (
  'emergency_fund', 'down_payment', 'vacation', 'education', 'other'
);

CREATE TABLE financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  target_amount numeric(12,2) NOT NULL,
  current_amount numeric(12,2) NOT NULL DEFAULT 0,
  target_date date,
  category goal_category NOT NULL DEFAULT 'other',
  notes text,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authorized_only" ON financial_goals
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));
