-- Shopfloor V8: Consumables Management (AS400 Integration)

-- 1. Cost Center Mappings
-- Maps AS400 "Customer Code" (Cost Center) to Shopfloor Areas (Assets)
CREATE TABLE IF NOT EXISTS cost_center_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code TEXT NOT NULL UNIQUE, -- e.g. "56122"
    description TEXT, -- e.g. "S&E NAVE 1"
    asset_id TEXT REFERENCES assets(id) ON DELETE SET NULL, -- Maps to a Shopfloor Area/Station
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Consumable Transactions
-- Stores raw line items imported from AS400 Excel
CREATE TABLE IF NOT EXISTS consumable_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_id UUID NOT NULL, -- Logical grouping for batch imports
    date DATE NOT NULL,
    week INTEGER,
    order_number TEXT,
    ims_number TEXT,
    customer_code TEXT, -- Original "Owner" from Excel
    area_source TEXT,   -- Original "Area" (often contains Employee Worker Number for PPI)
    prod_line TEXT NOT NULL, -- 'INT', 'PCS', 'PPI', 'PST'
    part_number TEXT,
    part_description TEXT,
    quantity NUMERIC DEFAULT 0,
    unit_cost NUMERIC DEFAULT 0,
    extension_cost NUMERIC DEFAULT 0,
    user_as400 TEXT,
    
    -- Mapped Fields (Filled by logic)
    mapped_asset_id TEXT REFERENCES assets(id) ON DELETE SET NULL,
    mapped_employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_consumables_date ON consumable_transactions(date);
CREATE INDEX IF NOT EXISTS idx_consumables_customer ON consumable_transactions(customer_code);
CREATE INDEX IF NOT EXISTS idx_consumables_prod_line ON consumable_transactions(prod_line);
CREATE INDEX IF NOT EXISTS idx_consumables_employee ON consumable_transactions(mapped_employee_id);
