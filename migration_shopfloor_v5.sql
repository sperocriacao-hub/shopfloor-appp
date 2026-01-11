-- Migration V5: Advanced Features (Quality & Scrap)

-- 1. Add Quality toggle to Assets
ALTER TABLE assets ADD COLUMN IF NOT EXISTS enable_quality_module BOOLEAN DEFAULT FALSE;

-- 2. Quality Cases Table
CREATE TYPE quality_type AS ENUM ('internal', 'supplier', 'warranty', 'audit');
CREATE TYPE quality_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE quality_status AS ENUM ('open', 'investigating', 'action_plan', 'resolved');
CREATE TYPE quality_methodology AS ENUM ('ishikawa', '5whys', 'a3', '8d', 'none');

CREATE TABLE IF NOT EXISTS quality_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    asset_id UUID REFERENCES assets(id),
    description TEXT NOT NULL,
    type quality_type NOT NULL,
    severity quality_severity DEFAULT 'medium',
    status quality_status DEFAULT 'open',
    methodology quality_methodology DEFAULT 'none',
    methodology_data JSONB DEFAULT '{}', -- Stores the structured data for the chosen methodology
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID -- Reference to auth.users or employees
);

-- 3. Quality Actions Table
CREATE TYPE action_status AS ENUM ('pending', 'in_progress', 'completed');

CREATE TABLE IF NOT EXISTS quality_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES quality_cases(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    responsible TEXT, -- Name or UUID
    deadline Date,
    status action_status DEFAULT 'pending',
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Scrap Reports Table
CREATE TYPE scrap_type AS ENUM ('total', 'partial');
CREATE TYPE scrap_action AS ENUM ('recycle', 'trash', 'rework', 'replacement');

CREATE TABLE IF NOT EXISTS scrap_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    asset_id UUID REFERENCES assets(id),
    reported_by UUID, -- Reference to employee
    type scrap_type NOT NULL,
    item_description TEXT, -- Required if partial
    quantity INTEGER DEFAULT 1,
    reason TEXT,
    action_taken scrap_action DEFAULT 'recycle',
    replacement_order_id UUID REFERENCES orders(id), -- If a new order was created
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
