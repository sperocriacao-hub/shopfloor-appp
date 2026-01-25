-- Shopfloor V6: Andon System

CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    station_id TEXT NOT NULL, -- Logical link to assets table
    type TEXT NOT NULL, -- 'material', 'maintenance', 'quality', 'help'
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'acknowledged', 'resolved'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by TEXT,
    
    FOREIGN KEY (station_id) REFERENCES assets(id)
);

-- Index for fast lookup of open alerts
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_alerts_station ON alerts(station_id);

-- Add support for "Acknowledged By" if needed later, for now resolved_by is enough.
