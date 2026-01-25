-- Shopfloor V6: Mold Management
-- Date: 2026-01-24

-- 1. Mold Compatibility (Pairs)
CREATE TABLE IF NOT EXISTS mold_compatibility (
    id TEXT PRIMARY KEY,
    hull_mold_id TEXT REFERENCES assets(id),
    deck_mold_id TEXT REFERENCES assets(id),
    compatibility_score INTEGER DEFAULT 100, -- Future use: match quality
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hull_mold_id, deck_mold_id)
);

-- 2. Mold Maintenance Logs
CREATE TABLE IF NOT EXISTS mold_maintenance_logs (
    id TEXT PRIMARY KEY,
    mold_id TEXT REFERENCES assets(id),
    description TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    status TEXT CHECK (status IN ('Open', 'In Progress', 'Resolved')),
    images JSONB DEFAULT '[]'::jsonb,
    technician_id TEXT, -- Optional: Link to employee
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mold_comp_hull ON mold_compatibility(hull_mold_id);
CREATE INDEX IF NOT EXISTS idx_mold_main_mold ON mold_maintenance_logs(mold_id);
