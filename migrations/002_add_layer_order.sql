-- Migration: Add layer_order column to track custom trait layer ordering
-- Date: 2025-11-27
-- Description: Adds layer_order JSONB column to store array of layer names in render order

-- Add layer_order column
ALTER TABLE cro_212hub_projects
ADD COLUMN IF NOT EXISTS layer_order JSONB;

-- Add comment
COMMENT ON COLUMN cro_212hub_projects.layer_order IS 'Array of layer names defining the order traits are stacked (bottom to top)';

-- Verification: Show updated table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cro_212hub_projects'
ORDER BY ordinal_position;
