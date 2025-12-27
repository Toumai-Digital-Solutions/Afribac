-- Migration: Update RLS policies to use 'published' instead of 'publish'
-- This ensures policies work correctly after standardizing status values

-- Update quiz_exercises policy that references courses status
DROP POLICY IF EXISTS "Users can view published quiz/exercises" ON quiz_exercises;
CREATE POLICY "Users can view published quiz/exercises" ON quiz_exercises
  FOR SELECT USING (
    status = 'published' OR
    auth.uid() IS NOT NULL OR
    (
      course_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM courses c
        WHERE c.id = quiz_exercises.course_id
          AND c.status = 'published'
      )
    )
  );

-- Update the questions policy
DROP POLICY IF EXISTS "Users can view questions of accessible quiz/exercises" ON questions;
CREATE POLICY "Users can view questions of accessible quiz/exercises" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_exercises qe
      WHERE qe.id = questions.quiz_exercise_id
        AND (qe.status = 'published' OR auth.uid() IS NOT NULL)
    )
  );

-- Update the answer_options policy if it exists
DROP POLICY IF EXISTS "Users can view answer options of accessible questions" ON answer_options;
CREATE POLICY "Users can view answer options of accessible questions" ON answer_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM questions q
      JOIN quiz_exercises qe ON qe.id = q.quiz_exercise_id
      WHERE q.id = answer_options.question_id
        AND (qe.status = 'published' OR auth.uid() IS NOT NULL)
    )
  );

COMMENT ON POLICY "Users can view published quiz/exercises" ON quiz_exercises IS
  'Students can view published quiz/exercises or any quiz/exercise linked to a published course';
