# Database Migrations

This directory contains database migration scripts for the CRO212HUB NFT Generator.

## How to Run Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file
4. Paste into the SQL Editor
5. Click **Run** to execute

### Option 2: Using Supabase CLI

```bash
supabase db push
```

## Migration Files

### 001_add_wallet_address.sql

**Date**: 2025-11-27

**Description**: Adds `wallet_address` column to `cro_212hub_projects` table to track who created each project.

**Changes**:
- Adds `wallet_address TEXT` column
- Creates index on `wallet_address` for faster queries
- Enables filtering and querying projects by creator wallet

**To apply this migration**:

1. Open Supabase SQL Editor
2. Copy and paste the contents of `001_add_wallet_address.sql`
3. Execute the script

**Verification**:

After running the migration, verify the column was added:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cro_212hub_projects'
ORDER BY ordinal_position;
```

You should see `wallet_address` in the list of columns.

## Migration History

| Migration | Date | Description | Status |
|-----------|------|-------------|--------|
| 001_add_wallet_address.sql | 2025-11-27 | Add wallet_address column | Pending |
