-- Migration: Add JSON content columns for Plate editor
-- This migration adds JSONB columns to store Plate's native JSON format
-- HTML columns are kept for backwards compatibility during migration

-- Add JSON content columns to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS content_json jsonb;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS content_format text DEFAULT 'html';

-- Add JSON content columns to exams table
ALTER TABLE exams ADD COLUMN IF NOT EXISTS questions_content_json jsonb;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS correction_content_json jsonb;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS content_format text DEFAULT 'html';

-- Add JSON content columns to quiz_exercises table
ALTER TABLE quiz_exercises ADD COLUMN IF NOT EXISTS instructions_json jsonb;
ALTER TABLE quiz_exercises ADD COLUMN IF NOT EXISTS content_format text DEFAULT 'html';

-- Add JSON content columns to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_text_json jsonb;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation_json jsonb;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS content_format text DEFAULT 'html';

-- Create indexes for JSON content columns (GIN indexes for JSONB)
CREATE INDEX IF NOT EXISTS idx_courses_content_json ON courses USING GIN (content_json);
CREATE INDEX IF NOT EXISTS idx_exams_questions_json ON exams USING GIN (questions_content_json);
CREATE INDEX IF NOT EXISTS idx_exams_correction_json ON exams USING GIN (correction_content_json);

-- Add comments for documentation
COMMENT ON COLUMN courses.content_json IS 'Plate editor JSON content format';
COMMENT ON COLUMN courses.content_format IS 'Content format: html or json';
COMMENT ON COLUMN exams.questions_content_json IS 'Plate editor JSON content format for questions';
COMMENT ON COLUMN exams.correction_content_json IS 'Plate editor JSON content format for corrections';
COMMENT ON COLUMN exams.content_format IS 'Content format: html or json';
COMMENT ON COLUMN quiz_exercises.instructions_json IS 'Plate editor JSON content format for instructions';
COMMENT ON COLUMN quiz_exercises.content_format IS 'Content format: html or json';
COMMENT ON COLUMN questions.question_text_json IS 'Plate editor JSON content format for question text';
COMMENT ON COLUMN questions.explanation_json IS 'Plate editor JSON content format for explanations';
COMMENT ON COLUMN questions.content_format IS 'Content format: html or json';
