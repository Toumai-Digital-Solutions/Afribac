-- Migration: Make series optional on quiz_exercises table
-- This allows quiz/exercises to be created without being tied to a specific series

-- Step 1: Make series_id nullable
ALTER TABLE quiz_exercises
  ALTER COLUMN series_id DROP NOT NULL;

-- Step 2: Add comment to explain the change
COMMENT ON COLUMN quiz_exercises.series_id IS
  'Optional series association. NULL means the quiz/exercise is available across all series.';
