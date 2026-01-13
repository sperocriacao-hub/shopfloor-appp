-- Add images and due_date to quality_cases
ALTER TABLE quality_cases 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- Optional: Comments for documentation
COMMENT ON COLUMN quality_cases.images IS 'Array of image URLs or Base64 strings (max 4 recommended)';
COMMENT ON COLUMN quality_cases.due_date IS 'Target date for resolving the quality case';
