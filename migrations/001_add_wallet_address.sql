-- Migration: Add wallet_address column to track project creators
-- Date: 2025-11-27
-- Description: Adds wallet_address column to cro_212hub_projects table to track who created each project

-- Add wallet_address column
ALTER TABLE cro_212hub_projects
ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Add comment
COMMENT ON COLUMN cro_212hub_projects.wallet_address IS 'Wallet address of the project creator/owner';

-- Create index for faster queries by wallet address
CREATE INDEX IF NOT EXISTS idx_projects_wallet_address ON cro_212hub_projects(wallet_address);

-- Verification: Show updated table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cro_212hub_projects'
ORDER BY ordinal_position;
