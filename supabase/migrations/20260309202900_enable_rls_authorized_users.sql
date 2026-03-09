-- Enable RLS on authorized_users to ensure the public read policy actually takes effect properly
ALTER TABLE authorized_users ENABLE ROW LEVEL SECURITY;
