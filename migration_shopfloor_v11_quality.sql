-- Quality Module Migration
-- Date: 2026-01-21

-- 1. Create Enums if they don't exist
DO $$ BEGIN
    CREATE TYPE quality_case_type AS ENUM ('internal', 'supplier', 'warranty', 'audit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE quality_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE quality_status AS ENUM ('open', 'investigating', 'action_plan', 'monitoring', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE quality_methodology AS ENUM ('ishikawa', '5whys', 'a3', '8d', 'none');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Quality Cases Table
CREATE TABLE IF NOT EXISTS quality_cases (
    id TEXT PRIMARY KEY,
    order_id TEXT, -- Optional link to Production Order
    asset_id TEXT NOT NULL, -- Where it happened
    description TEXT NOT NULL,
    type quality_case_type NOT NULL DEFAULT 'internal',
    severity quality_severity NOT NULL DEFAULT 'medium',
    status quality_status NOT NULL DEFAULT 'open',
    methodology quality_methodology NOT NULL DEFAULT 'none',
    methodology_data JSONB, -- For saving structured analysis
    images TEXT[], -- Array of URLs/Base64
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT
);

-- 3. Create Quality Actions Table
CREATE TABLE IF NOT EXISTS quality_actions (
    id TEXT PRIMARY KEY,
    case_id TEXT REFERENCES quality_cases(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    responsible TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Add Quality Enable Flag to Assets
ALTER TABLE assets ADD COLUMN IF NOT EXISTS enable_quality_module BOOLEAN DEFAULT FALSE;
