-- Migration: Content format cleanup and documentation
-- This migration improves content format handling and provides migration helpers

-- Add helper function to check if JSON content exists
CREATE OR REPLACE FUNCTION has_json_content(format text, json_col jsonb, text_col text)
RETURNS boolean AS $$
BEGIN
  RETURN format = 'json' AND json_col IS NOT NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update content_format to 'json' for all records with JSON content
UPDATE courses
SET content_format = 'json'
WHERE content_json IS NOT NULL AND content_format = 'html';

UPDATE quiz_exercises
SET content_format = 'json'
WHERE instructions_json IS NOT NULL AND content_format = 'html';

UPDATE questions
SET content_format = 'json'
WHERE (question_text_json IS NOT NULL OR explanation_json IS NOT NULL) AND content_format = 'html';

UPDATE exams
SET content_format = 'json'
WHERE (questions_content_json IS NOT NULL OR correction_content_json IS NOT NULL) AND content_format = 'html';

-- Note: We don't add strict constraints because content can be NULL even when format is set
-- The format indicates the INTENDED format, but content may not be created yet

-- Add documentation
COMMENT ON COLUMN courses.content IS 'HTML content (legacy). Use content_json for new content.';
COMMENT ON COLUMN quiz_exercises.instructions IS 'HTML instructions (legacy). Use instructions_json for new content.';
COMMENT ON COLUMN questions.question_text IS 'Text question (legacy). Use question_text_json for new content.';
COMMENT ON COLUMN questions.explanation IS 'Text explanation (legacy). Use explanation_json for new content.';

-- Create a view to easily access the correct content based on format
CREATE OR REPLACE VIEW courses_with_content AS
SELECT
  c.*,
  CASE
    WHEN c.content_format = 'json' THEN 'json'
    ELSE 'html'
  END as active_format,
  CASE
    WHEN c.content_format = 'json' THEN c.content_json
    ELSE NULL
  END as active_content_json,
  CASE
    WHEN c.content_format = 'html' THEN c.content
    ELSE NULL
  END as active_content_html
FROM courses c;

COMMENT ON VIEW courses_with_content IS 'View that provides easy access to course content in the correct format';
