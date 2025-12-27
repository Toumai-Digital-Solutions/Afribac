-- Add supported countries to the database
-- First, let's add a column to mark countries as actively supported
ALTER TABLE countries ADD COLUMN IF NOT EXISTS is_supported BOOLEAN DEFAULT false;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;


-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_countries_is_supported ON countries(is_supported, display_order);
