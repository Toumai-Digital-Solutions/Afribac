-- Relax profile constraints to support OAuth onboarding
ALTER TABLE public.profiles
  ALTER COLUMN country_id DROP NOT NULL;

-- Drop and recreate the student series constraint to allow temporary nulls during onboarding
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_student_series;

ALTER TABLE public.profiles
  ADD CONSTRAINT valid_student_series CHECK (
    (
      role = 'user' AND (
        -- Allow missing series during onboarding when country is not set yet
        series_id IS NOT NULL OR country_id IS NULL
      )
    ) OR (
      role IN ('member', 'admin') AND series_id IS NULL
    )
  );

