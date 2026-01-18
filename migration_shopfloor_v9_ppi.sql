-- Shopfloor V9: PPI Requests (Pedidos de EPIs)

-- Table to store requests for PPE/Consumables from the Shopfloor to Warehouse
CREATE TABLE IF NOT EXISTS ppe_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Request Details
    employee_id UUID REFERENCES employees(id), -- Who needs it?
    asset_id TEXT REFERENCES assets(id), -- For which area? (Using TEXT to match asset_id type)
    
    -- Item Details
    item_name TEXT NOT NULL, -- Part Description
    part_number TEXT, -- Optional if known
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_cost NUMERIC DEFAULT 0, -- Estimated cost for approval
    
    -- Status Tracking
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processed', 'delivered', 'rejected'
    
    -- Metadata
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Processing Info (Filled by Warehouse)
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by TEXT, -- User who processed in AS400
    
    -- Notes
    notes TEXT
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_ppe_requests_status ON ppe_requests(status);
CREATE INDEX IF NOT EXISTS idx_ppe_requests_date ON ppe_requests(request_date);
