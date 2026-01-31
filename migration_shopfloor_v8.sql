-- Migration V8: Mold Maintenance & Spatial Tracking

-- 1. Mold Geometries (Stores the SVG for a specific model/part)
CREATE TABLE IF NOT EXISTS mold_geometries (
    id TEXT PRIMARY KEY,
    product_model_id TEXT, -- e.g., 'Hull 40ft'
    part_type TEXT, -- 'Hull', 'Deck', 'SmallPart'
    svg_content TEXT, -- Full SVG XML string
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Maintenance Orders (OS) - More detailed than previous logs
CREATE TABLE IF NOT EXISTS maintenance_orders (
    id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL REFERENCES assets(id),
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'verified')),
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Personnel
    reported_by TEXT, -- User ID or Name (from POP)
    technician_id TEXT, -- User ID
    
    -- Metadata
    description TEXT,
    total_time_minutes INTEGER DEFAULT 0
);

-- 3. Maintenance Pins (The spatial defects)
CREATE TABLE IF NOT EXISTS maintenance_pins (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES maintenance_orders(id),
    
    -- Spatial Data (Relative coordinates 0-100% or absolute pixels)
    pos_x FLOAT NOT NULL,
    pos_y FLOAT NOT NULL,
    
    -- Defect Details
    type TEXT, -- 'crack', 'scratch', 'polish', 'wax'
    severity TEXT, -- 'monitoring', 'repair_needed'
    status TEXT CHECK (status IN ('open', 'fixed')),
    
    -- Media
    photo_before_url TEXT,
    photo_after_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fixed_at TIMESTAMP WITH TIME ZONE
);

-- Add 'maintenance_status' to Assets if not exists
ALTER TABLE assets ADD COLUMN IF NOT EXISTS maintenance_status TEXT DEFAULT 'ok'; -- 'ok', 'needs_repair', 'blocked'
