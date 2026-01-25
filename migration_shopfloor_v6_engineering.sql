-- Shopfloor V6: Production Engineering & Advanced Planning
-- Date: 2026-01-24

-- 1. Production Lines (Configuração de Linhas A, B, C, D)
CREATE TABLE IF NOT EXISTS production_lines (
    id TEXT PRIMARY KEY, -- 'A', 'B', 'C', 'D'
    description TEXT,
    daily_capacity INTEGER DEFAULT 1,
    allowed_models TEXT[], -- Array of Product Model IDs allowed on this line
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sequencing Rules (Lead Times & Offsets)
-- Defines "Buffer" and "Duration" for a Model in a specific Area
CREATE TABLE IF NOT EXISTS sequencing_rules (
    id TEXT PRIMARY KEY,
    product_model_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    area_id TEXT NOT NULL, -- Logical Area (Carpintaria, Laminacao, etc)
    offset_days INTEGER DEFAULT 0, -- Days BEFORE Final Delivery (T-X)
    duration_days INTEGER DEFAULT 1, -- Estimated duration in this area
    dependency_area_id TEXT, -- Optional: Area that must finish before this one starts (backward link)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sequencing_model ON sequencing_rules(product_model_id);
CREATE INDEX IF NOT EXISTS idx_sequencing_area ON sequencing_rules(area_id);

-- 3. Add Line assignment to Orders if not exists (Shopfloor 4.0 feature)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS production_line_id TEXT REFERENCES production_lines(id);

COMMENT ON TABLE production_lines IS 'Configuration of physical production lines (A, B, C, D)';
COMMENT ON TABLE sequencing_rules IS 'Lead Time Offsets: How many days before delivery an area must start.';
