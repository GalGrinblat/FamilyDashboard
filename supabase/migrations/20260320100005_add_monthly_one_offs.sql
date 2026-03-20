CREATE TABLE monthly_one_offs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year varchar(7) NOT NULL,
  title text NOT NULL,
  amount numeric(12,2) NOT NULL,
  type flow_type NOT NULL,
  day_of_month integer NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE monthly_one_offs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authorized_only" ON monthly_one_offs
  FOR ALL USING (auth.email() IN (SELECT email FROM authorized_users));
