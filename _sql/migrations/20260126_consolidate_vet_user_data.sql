-- ============================================================================
-- Migration: Consolidate Veterinarian and User Profile Data
-- ============================================================================
-- Purpose: Remove duplicate user data from veterinarians table
-- Strategy: Migrate vet data to users table and establish proper FK relationship
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Create temporary column to track migration
-- ============================================================================
ALTER TABLE veterinarians 
ADD COLUMN IF NOT EXISTS temp_user_id uuid,
ADD COLUMN IF NOT EXISTS temp_migrated boolean DEFAULT false;

-- ============================================================================
-- STEP 2: Migrate existing veterinarians to users table
-- ============================================================================
-- For each veterinarian without a user account, create one
-- Note: password_hash is set to NULL initially - veterinarians must reset password
INSERT INTO users (email, password_hash, first_name, last_name, display_name, status, is_email_verified, created_at, updated_at)
SELECT 
    v.email,
    NULL, -- password_hash - veterinarians must set password via reset flow
    v.first_name,
    v.last_name,
    CONCAT(v.first_name, ' ', v.last_name),
    'active',
    false,
    v.created_at,
    v.updated_at
FROM veterinarians v
WHERE v.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM users u 
    WHERE lower(u.email) = lower(v.email)
  )
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- STEP 3: Link veterinarians to users via temp column
-- ============================================================================
UPDATE veterinarians v
SET temp_user_id = u.id,
    temp_migrated = true
FROM users u
WHERE lower(v.email) = lower(u.email)
  AND v.deleted_at IS NULL;

-- ============================================================================
-- STEP 4: Verify migration success
-- ============================================================================
-- Check if there are any veterinarians without a matching user
-- (This should be empty if migration was successful)
SELECT COUNT(*) as unmatched_vets 
FROM veterinarians 
WHERE deleted_at IS NULL 
  AND temp_user_id IS NULL;

-- ============================================================================
-- STEP 5: Add user_id column (non-null after data is migrated)
-- ============================================================================
ALTER TABLE veterinarians
ADD COLUMN user_id uuid;

-- ============================================================================
-- STEP 6: Populate user_id from temp column
-- ============================================================================
UPDATE veterinarians
SET user_id = temp_user_id
WHERE temp_user_id IS NOT NULL;

-- ============================================================================
-- STEP 7: Make user_id NOT NULL and UNIQUE
-- ============================================================================
ALTER TABLE veterinarians
ALTER COLUMN user_id SET NOT NULL,
ADD CONSTRAINT fk_veterinarians_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT uk_veterinarians_user_id UNIQUE (user_id);

-- ============================================================================
-- STEP 8: Remove duplicate columns from veterinarians
-- ============================================================================
ALTER TABLE veterinarians
DROP COLUMN IF EXISTS first_name,
DROP COLUMN IF EXISTS last_name,
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS mobile;

-- ============================================================================
-- STEP 9: Drop old unique constraint on email
-- ============================================================================
DROP INDEX IF EXISTS idx_veterinarians_email;

-- ============================================================================
-- STEP 10: Add new index on user_id
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_veterinarians_user_id ON veterinarians (user_id);

-- ============================================================================
-- STEP 11: Clean up temporary columns
-- ============================================================================
ALTER TABLE veterinarians
DROP COLUMN IF EXISTS temp_user_id,
DROP COLUMN IF EXISTS temp_migrated;

-- ============================================================================
-- STEP 12: Verify final state
-- ============================================================================
-- Count veterinarians with valid user_id links
SELECT COUNT(*) as vets_with_users
FROM veterinarians v
WHERE v.deleted_at IS NULL
  AND v.user_id IS NOT NULL;

-- Verify no orphaned veterinarians
SELECT COUNT(*) as orphaned_vets
FROM veterinarians v
WHERE v.deleted_at IS NULL
  AND v.user_id IS NULL;

-- ============================================================================
-- Migration complete
-- ============================================================================
COMMIT;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed):
-- ============================================================================
-- If migration fails and you need to rollback:
-- 1. ROLLBACK; (if still in transaction)
-- 2. Delete any newly created users from the migration
-- 3. Restore original schema if backup exists
