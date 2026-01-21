-- Migration V10: Scrap Management (Safety Check & Creation)

-- 1. Create Enums if not exist
DO $$ BEGIN
    CREATE TYPE scrap_type AS ENUM ('total', 'partial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE scrap_action AS ENUM ('recycle', 'trash', 'rework', 'replacement');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Table
CREATE TABLE IF NOT EXISTS scrap_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT REFERENCES orders(id),
    asset_id TEXT REFERENCES assets(id), -- Station where scrap occurred
    reported_by TEXT, -- Employee Name or ID
    type scrap_type NOT NULL,
    item_description TEXT, -- Required if partial
    quantity INTEGER DEFAULT 1,
    reason TEXT, -- 'process_fail', 'machine_fail', 'material_defect'
    action_taken scrap_action DEFAULT 'recycle',
    replacement_order_id TEXT REFERENCES orders(id), -- Optional link to new order
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add policy if RLS is enabled (Optional, usually we are currently using service_role or authenticated with open access for this prototype)
-- ALTER TABLE scrap_reports ENABLE ROW LEVEL SECURITY;
