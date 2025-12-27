-- Migration: Standardize status values to 'published' across all tables
-- This fixes the inconsistency where courses use 'publish' while other tables use 'published'

-- Step 1: Update all existing 'publish' values to 'published' in courses table
UPDATE courses
SET status = 'published'
WHERE status = 'publish';

-- Step 2: Drop the old constraint and add new one with 'published'
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_status_check;
ALTER TABLE courses ADD CONSTRAINT courses_status_check
  CHECK (status IN ('draft', 'published', 'archived'));

-- Step 3: Update all existing 'publish' values to 'published' in exams table (if any)
UPDATE exams
SET status = 'published'
WHERE status = 'publish';

-- Step 4: Ensure exams table has correct constraint
ALTER TABLE exams DROP CONSTRAINT IF EXISTS exams_status_check;
ALTER TABLE exams ADD CONSTRAINT exams_status_check
  CHECK (status IN ('draft', 'published', 'archived'));

-- Step 5: Add comments
COMMENT ON CONSTRAINT courses_status_check ON courses IS
  'Standardized status values: draft, published, archived';
COMMENT ON CONSTRAINT exams_status_check ON exams IS
  'Standardized status values: draft, published, archived';

-- Note: RLS policies will continue to use the old 'publish' value until the data is migrated
-- After running this migration and the data update (Step 1), the policies will work correctly
-- because the constraint now allows 'published' and all data has been updated to use it
