-- Add course relationship to quiz_exercises
ALTER TABLE quiz_exercises 
ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_quiz_exercises_course_id ON quiz_exercises(course_id);

-- Update RLS policies to consider course access
DROP POLICY IF EXISTS "Users can view published quiz/exercises" ON quiz_exercises;
CREATE POLICY "Users can view published quiz/exercises" ON quiz_exercises
  FOR SELECT USING (
    status = 'published' OR 
    auth.uid() IS NOT NULL OR
    (course_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM courses c 
      WHERE c.id = quiz_exercises.course_id 
      AND c.status = 'publish'
    ))
  );

-- Drop and recreate the detailed view to include course information
DROP VIEW IF EXISTS quiz_exercise_details CASCADE;
CREATE VIEW quiz_exercise_details AS
SELECT 
  qe.*,
  s.name as subject_name,
  s.color as subject_color,
  s.icon as subject_icon,
  ser.name as series_name,
  c.name as country_name,
  p.full_name as author_name,
  -- Course information (optional) - course_id already included in qe.*
  course.title as course_title,
  course.status as course_status,
  COALESCE(
    (SELECT COUNT(*) FROM questions WHERE quiz_exercise_id = qe.id), 
    0
  ) as question_count,
  COALESCE(
    (SELECT SUM(points) FROM questions WHERE quiz_exercise_id = qe.id), 
    0
  ) as total_points,
  COALESCE(
    ARRAY_AGG(DISTINCT t.name ORDER BY t.name) FILTER (WHERE t.name IS NOT NULL), 
    ARRAY[]::text[]
  ) as tag_names
FROM quiz_exercises qe
LEFT JOIN subjects s ON qe.subject_id = s.id
LEFT JOIN series ser ON qe.series_id = ser.id
LEFT JOIN countries c ON ser.country_id = c.id
LEFT JOIN profiles p ON qe.created_by = p.id
LEFT JOIN courses course ON qe.course_id = course.id  -- Optional course link
LEFT JOIN quiz_exercise_tags qet ON qe.id = qet.quiz_exercise_id
LEFT JOIN tags t ON qet.tag_id = t.id
GROUP BY qe.id, qe.title, qe.description, qe.content_type, qe.subject_id, qe.series_id, qe.course_id, 
         qe.difficulty_level, qe.estimated_duration, qe.instructions, qe.status, qe.view_count, 
         qe.created_by, qe.created_at, qe.updated_at,
         s.name, s.color, s.icon, ser.name, c.name, p.full_name, 
         course.title, course.status;

-- Recreate searchable view
DROP VIEW IF EXISTS searchable_quiz_exercises;
CREATE VIEW searchable_quiz_exercises AS
SELECT 
  qed.*,
  (
    setweight(to_tsvector('french', COALESCE(qed.title, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(qed.description, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(qed.instructions, '')), 'C') ||
    setweight(to_tsvector('french', COALESCE(qed.subject_name, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(qed.series_name, '')), 'C') ||
    setweight(to_tsvector('french', COALESCE(qed.course_title, '')), 'B')
  ) as search_vector
FROM quiz_exercise_details qed;

-- Create a view for course-linked quiz/exercises (for course detail pages)
CREATE VIEW course_quiz_exercises AS
SELECT 
  qe.id,
  qe.title,
  qe.description,
  qe.content_type,
  qe.difficulty_level,
  qe.estimated_duration,
  qe.status,
  qe.view_count,
  qe.course_id,
  qe.created_at,
  qe.updated_at,
  COALESCE(
    (SELECT COUNT(*) FROM questions WHERE quiz_exercise_id = qe.id), 
    0
  ) as question_count,
  COALESCE(
    (SELECT SUM(points) FROM questions WHERE quiz_exercise_id = qe.id), 
    0
  ) as total_points,
  s.name as subject_name,
  s.color as subject_color,
  s.icon as subject_icon
FROM quiz_exercises qe
LEFT JOIN subjects s ON qe.subject_id = s.id
WHERE qe.course_id IS NOT NULL
ORDER BY qe.created_at DESC;
