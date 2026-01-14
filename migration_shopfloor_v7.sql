-- Migration V7: Tool Management Module

-- 1. Tools Table
CREATE TABLE IF NOT EXISTS tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- Serial Number / Barcode
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- Manual, Electric, Pneumatic, etc.
    status TEXT NOT NULL DEFAULT 'available', -- available, in_use, maintenance, scrapped, lost
    condition TEXT DEFAULT 'good', -- new, good, fair, poor
    current_holder_id TEXT REFERENCES employees(id), -- Null if in crib
    location TEXT DEFAULT 'ferramentaria', -- ferramentaria, maintenance, employee
    purchase_date DATE,
    last_maintenance DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tool Transactions (History/Guias)
CREATE TABLE IF NOT EXISTS tool_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID REFERENCES tools(id) NOT NULL,
    employee_id TEXT REFERENCES employees(id), -- Receiver/Returner
    action TEXT NOT NULL, -- checkout, checkin, maintenance_out, maintenance_return
    signature TEXT, -- Base64 Signature Data
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT -- System user who performed the action
);

-- 3. Tool Maintenance Records
CREATE TABLE IF NOT EXISTS tool_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID REFERENCES tools(id) NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, in_progress, waiting_parts, completed, condemned
    cost NUMERIC DEFAULT 0,
    replacement_requested BOOLEAN DEFAULT FALSE,
    technician_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Helper Indexes
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_holder ON tools(current_holder_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tool ON tool_transactions(tool_id);
