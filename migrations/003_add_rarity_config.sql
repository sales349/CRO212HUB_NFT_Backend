-- Migration: Add rarity_config column to store trait weight configuration
-- Date: 2025-11-27
-- Description: Adds rarity_config JSONB column to store trait weights for weighted generation

-- Add rarity_config column
ALTER TABLE cro_212hub_projects
ADD COLUMN IF NOT EXISTS rarity_config JSONB;

-- Add comment
COMMENT ON COLUMN cro_212hub_projects.rarity_config IS 'Trait weight configuration for weighted random generation. Structure: { "layerName": { "traitName": weight } }';

-- Example data structure:
-- {
--   "Background": {
--     "Blue Sky": 20,
--     "Red Sunset": 15,
--     "Green Forest": 10
--   },
--   "Body": {
--     "Red": 10,
--     "Blue": 25,
--     "Green": 15
--   }
-- }

-- Verification: Show updated table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cro_212hub_projects'
ORDER BY ordinal_position;
