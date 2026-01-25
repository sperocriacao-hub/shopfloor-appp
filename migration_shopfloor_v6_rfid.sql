-- Shopfloor V6: Hardware & RFID Integration
-- Date: 2026-01-24

-- 1. Add RFID/NFC Tag to Assets (Moldes, Machines, Workstations)
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS rfid_tag TEXT DEFAULT NULL;

-- 2. Add Fixed Location Reader ID to Assets (For automatic station detection)
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS location_fixed_id TEXT DEFAULT NULL;

-- 3. Add RFID/NFC Tag to Employees
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS rfid_tag TEXT DEFAULT NULL;

-- 4. Create constraints to ensure unique tags (Handling NULLs: Multiple NULLs are allowed)
CREATE UNIQUE INDEX IF NOT EXISTS idx_assets_rfid_tag ON assets(rfid_tag) WHERE rfid_tag IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_rfid_tag ON employees(rfid_tag) WHERE rfid_tag IS NOT NULL;

-- 5. Add comments for clarity
COMMENT ON COLUMN assets.rfid_tag IS 'Unique Hex/ID from the NFC/RFID Tag attached to the physical asset';
COMMENT ON COLUMN assets.location_fixed_id IS 'ID of the permanent reader installed at this station (e.g., READER-B44-LAM)';
COMMENT ON COLUMN employees.rfid_tag IS 'Unique Hex/ID from the Employee Badge';
