-- CRO212HUB NFT Generator & Launchpad - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create all required tables

-- ============================================================================
-- Table: cro_212hub_projects
-- Stores NFT project configurations
-- ============================================================================

CREATE TABLE IF NOT EXISTS cro_212hub_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  description TEXT,
  max_supply INTEGER NOT NULL,
  mint_price TEXT NOT NULL, -- Stored as string to preserve decimal precision (e.g. "1.5" CRO)
  contract_address TEXT,
  base_uri TEXT,
  treasury_wallet TEXT,
  platform_fee_bps INTEGER DEFAULT 500, -- Basis points (500 = 5%)
  status TEXT NOT NULL DEFAULT 'setup', -- setup, traits_uploaded, generated, deployed, active
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_status ON cro_212hub_projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON cro_212hub_projects(created_at DESC);

-- ============================================================================
-- Table: cro_212hub_traits
-- Stores uploaded trait images metadata
-- ============================================================================

CREATE TABLE IF NOT EXISTS cro_212hub_traits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES cro_212hub_projects(id) ON DELETE CASCADE,
  layer_type TEXT NOT NULL, -- Background, Body, Eyes, Mouth, Clothes, Accessories, etc.
  trait_name TEXT NOT NULL, -- Friendly name (e.g. "Jungle Ruins", "Gold Armor")
  file_name TEXT NOT NULL, -- Original filename
  file_path TEXT NOT NULL, -- Relative path: uploads/traits/{projectId}/{layerType}/{filename}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_traits_project_id ON cro_212hub_traits(project_id);
CREATE INDEX IF NOT EXISTS idx_traits_layer_type ON cro_212hub_traits(project_id, layer_type);

-- ============================================================================
-- Table: cro_212hub_generated_tokens
-- Stores generated NFT data (images, metadata, rarity)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cro_212hub_generated_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES cro_212hub_projects(id) ON DELETE CASCADE,
  token_id INTEGER NOT NULL, -- 1, 2, 3, ...
  image_path TEXT NOT NULL, -- output/{projectId}/images/{tokenId}.png
  metadata_path TEXT NOT NULL, -- output/{projectId}/metadata/{tokenId}.json
  attributes JSONB NOT NULL, -- Array of {trait_type, value} objects
  rarity_score NUMERIC(10, 2), -- Calculated rarity score
  rarity_rank INTEGER, -- 1 = rarest, maxSupply = most common
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, token_id) -- Ensure no duplicate token IDs per project
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tokens_project_id ON cro_212hub_generated_tokens(project_id);
CREATE INDEX IF NOT EXISTS idx_tokens_rarity_rank ON cro_212hub_generated_tokens(project_id, rarity_rank);
CREATE INDEX IF NOT EXISTS idx_tokens_token_id ON cro_212hub_generated_tokens(project_id, token_id);

-- ============================================================================
-- Function: Update updated_at timestamp automatically
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cro_212hub_projects
DROP TRIGGER IF EXISTS update_projects_updated_at ON cro_212hub_projects;
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON cro_212hub_projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE cro_212hub_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cro_212hub_traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE cro_212hub_generated_tokens ENABLE ROW LEVEL SECURITY;

-- Allow public read access to projects (for mint page)
CREATE POLICY "Public read access for projects"
ON cro_212hub_projects
FOR SELECT
TO public
USING (true);

-- Allow public read access to generated tokens (for mint page)
CREATE POLICY "Public read access for tokens"
ON cro_212hub_generated_tokens
FOR SELECT
TO public
USING (true);

-- For admin operations, you'll need to use the service_role key in your backend
-- Or create a custom authentication system

-- ============================================================================
-- Sample Data (Optional - for testing)
-- ============================================================================

-- Uncomment to insert a test project:
/*
INSERT INTO cro_212hub_projects (name, symbol, description, max_supply, mint_price, status)
VALUES (
  'Test Collection',
  'TEST',
  'A test NFT collection for development',
  100,
  '1.0',
  'setup'
);
*/

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check if tables were created successfully:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'cro_212hub_%';

-- Count records in each table:
SELECT
  (SELECT COUNT(*) FROM cro_212hub_projects) as projects_count,
  (SELECT COUNT(*) FROM cro_212hub_traits) as traits_count,
  (SELECT COUNT(*) FROM cro_212hub_generated_tokens) as tokens_count;
