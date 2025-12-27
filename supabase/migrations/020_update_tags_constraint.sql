-- Remove CHECK constraint on tags.type to allow any text value
-- This makes tag types flexible and not limited to predefined values

ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_type_check;
