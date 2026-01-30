-- Add IAM columns to employees table

ALTER TABLE employees ADD COLUMN IF NOT EXISTS role text DEFAULT 'operator';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{}'::jsonb;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS pin_hash text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS system_access boolean DEFAULT false;

-- Enable Realtime for employees updates (if not already)
-- alter publication supabase_realtime add table employees;

-- Default permissions for existing operators (Optional)
-- UPDATE employees SET permissions = '{"mobile": "read", "dashboard": "read"}'::jsonb WHERE role = 'operator' AND permissions = '{}'::jsonb;
