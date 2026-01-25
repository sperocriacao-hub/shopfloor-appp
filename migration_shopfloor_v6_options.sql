-- Shopfloor V6: Option Packages & Real Cost
-- Date: 2026-01-24

-- Add standard_time_minutes to option_tasks for cost calculation
ALTER TABLE option_tasks
ADD COLUMN IF NOT EXISTS standard_time_minutes INTEGER DEFAULT 0;

COMMENT ON COLUMN option_tasks.standard_time_minutes IS 'Additional time (cost) required for this specific task.';
