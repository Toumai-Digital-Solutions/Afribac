-- Add study goals and weekly availability fields to profiles
ALTER TABLE profiles
ADD COLUMN study_goal TEXT CHECK (study_goal IN ('baccalaureat', 'improve_grades', 'catch_up', 'deepen_knowledge', 'other')),
ADD COLUMN weekly_availability_hours INTEGER CHECK (weekly_availability_hours >= 1 AND weekly_availability_hours <= 40);

-- Add index for filtering by study goal
CREATE INDEX idx_profiles_study_goal ON profiles(study_goal);

-- Comment on columns for documentation
COMMENT ON COLUMN profiles.study_goal IS 'User study goal: baccalaureat, improve_grades, catch_up, deepen_knowledge, other';
COMMENT ON COLUMN profiles.weekly_availability_hours IS 'Weekly hours available for studying (1-40)';
