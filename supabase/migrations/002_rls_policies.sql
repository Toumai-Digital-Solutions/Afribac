-- Enable Row Level Security on all relevant tables
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_exercise_tags ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION public.user_country_id() RETURNS UUID AS $$
  SELECT country_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.user_role() RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.user_series_id() RETURNS UUID AS $$
  SELECT series_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.user_requires_onboarding() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND (
        country_id IS NULL OR
        (role = 'user' AND series_id IS NULL)
      )
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Countries policies
CREATE POLICY "Users can view their own country" ON countries
  FOR SELECT USING (
    id = public.user_country_id() OR public.user_role() = 'admin'
  );

CREATE POLICY "Onboarding users can view countries" ON countries
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      public.user_role() = 'admin' OR
      public.user_requires_onboarding()
    )
  );

CREATE POLICY "Only admins can manage countries" ON countries
  FOR ALL USING (public.user_role() = 'admin');

-- Series policies
CREATE POLICY "Users can view series from their country" ON series
  FOR SELECT USING (
    country_id = public.user_country_id() OR public.user_role() = 'admin'
  );

CREATE POLICY "Onboarding users can view series" ON series
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      public.user_role() = 'admin' OR
      public.user_requires_onboarding()
    )
  );

CREATE POLICY "Only admins can manage series" ON series
  FOR ALL USING (public.user_role() = 'admin');

-- Subjects policies
CREATE POLICY "Authenticated users can view subjects" ON subjects
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage subjects" ON subjects
  FOR ALL USING (public.user_role() = 'admin');

-- Series subjects policies
CREATE POLICY "Users can view series-subjects from their country" ON series_subjects
  FOR SELECT USING (
    series_id IN (
      SELECT id FROM series WHERE country_id = public.user_country_id()
    ) OR public.user_role() = 'admin'
  );

CREATE POLICY "Only admins can manage series-subjects" ON series_subjects
  FOR ALL USING (public.user_role() = 'admin');

-- Tags policies
CREATE POLICY "Authenticated users can view tags" ON tags
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Members and admins can manage tags" ON tags
  FOR ALL USING (public.user_role() IN ('member', 'admin'));

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Members can view profiles from their country" ON profiles
  FOR SELECT USING (
    id = auth.uid() OR 
    (public.user_role() = 'member' AND country_id = public.user_country_id()) OR
    public.user_role() = 'admin'
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = public.user_role());

CREATE POLICY "Only admins can manage user roles" ON profiles
  FOR ALL USING (public.user_role() = 'admin');

-- Courses policies
CREATE POLICY "Users can view published courses from their country" ON courses
  FOR SELECT USING (
    CASE 
      WHEN public.user_role() = 'admin' THEN TRUE
      WHEN public.user_role() = 'member' THEN 
        subject_id IN (
          SELECT ss.subject_id FROM series_subjects ss
          JOIN series s ON ss.series_id = s.id
          WHERE s.country_id = public.user_country_id()
        )
      WHEN public.user_role() = 'user' THEN 
        status = 'publish' AND subject_id IN (
          SELECT ss.subject_id FROM series_subjects ss
          JOIN series s ON ss.series_id = s.id
          WHERE s.country_id = public.user_country_id()
        )
      ELSE FALSE
    END
  );

CREATE POLICY "Members can create courses for their country" ON courses
  FOR INSERT WITH CHECK (
    public.user_role() IN ('member', 'admin') AND 
    (public.user_role() = 'admin' OR subject_id IN (
      SELECT ss.subject_id FROM series_subjects ss
      JOIN series s ON ss.series_id = s.id
      WHERE s.country_id = public.user_country_id()
    ))
  );

CREATE POLICY "Members can update any course from their country" ON courses
  FOR UPDATE USING (
    public.user_role() IN ('member', 'admin') AND 
    (public.user_role() = 'admin' OR subject_id IN (
      SELECT ss.subject_id FROM series_subjects ss
      JOIN series s ON ss.series_id = s.id
      WHERE s.country_id = public.user_country_id()
    ))
  );

CREATE POLICY "Members can delete any course from their country" ON courses
  FOR DELETE USING (
    public.user_role() IN ('member', 'admin') AND 
    (public.user_role() = 'admin' OR subject_id IN (
      SELECT ss.subject_id FROM series_subjects ss
      JOIN series s ON ss.series_id = s.id
      WHERE s.country_id = public.user_country_id()
    ))
  );

-- Course tags policies
CREATE POLICY "Users can view course tags based on course access" ON course_tags
  FOR SELECT USING (
    course_id IN (SELECT id FROM courses)
  );

CREATE POLICY "Members can manage course tags" ON course_tags
  FOR ALL USING (
    course_id IN (SELECT id FROM courses)
  );

-- Course series policies
CREATE POLICY "Users can view course_series via accessible courses" ON course_series
  FOR SELECT USING (
    course_id IN (SELECT id FROM courses)
  );

CREATE POLICY "Members can insert course_series" ON course_series
  FOR INSERT WITH CHECK (
    public.user_role() IN ('member', 'admin') AND
    course_id IN (SELECT id FROM courses)
  );

CREATE POLICY "Members can update course_series" ON course_series
  FOR UPDATE USING (
    public.user_role() IN ('member', 'admin') AND
    course_id IN (SELECT id FROM courses)
  )
  WITH CHECK (
    public.user_role() IN ('member', 'admin') AND
    course_id IN (SELECT id FROM courses)
  );

CREATE POLICY "Members can delete course_series" ON course_series
  FOR DELETE USING (
    public.user_role() IN ('member', 'admin') AND
    course_id IN (SELECT id FROM courses)
  );

-- User progress policies
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Members can view progress from their country" ON user_progress
  FOR SELECT USING (
    user_id = auth.uid() OR 
    (public.user_role() = 'member' AND user_id IN (
      SELECT id FROM profiles WHERE country_id = public.user_country_id()
    )) OR
    public.user_role() = 'admin'
  );

CREATE POLICY "Users can manage own progress" ON user_progress
  FOR ALL USING (user_id = auth.uid());

-- Exams policies
CREATE POLICY "Users can view exams from their country" ON exams
  FOR SELECT USING (
    CASE
      WHEN public.user_role() = 'admin' THEN TRUE
      WHEN public.user_role() = 'member' THEN
        series_id IN (
          SELECT id FROM series WHERE country_id = public.user_country_id()
        )
      WHEN public.user_role() = 'user' THEN
        status = 'published' AND series_id IN (
          SELECT id FROM series WHERE country_id = public.user_country_id()
        )
      ELSE FALSE
    END
  );

CREATE POLICY "Members can manage exams" ON exams
  FOR ALL USING (
    public.user_role() IN ('member', 'admin') AND (
      public.user_role() = 'admin' OR
      series_id IN (
        SELECT id FROM series WHERE country_id = public.user_country_id()
      )
    )
  )
  WITH CHECK (
    public.user_role() IN ('member', 'admin') AND (
      public.user_role() = 'admin' OR
      series_id IN (
        SELECT id FROM series WHERE country_id = public.user_country_id()
      )
    )
  );

CREATE POLICY "Users can view exam tags" ON exam_tags
  FOR SELECT USING (
    exam_id IN (SELECT id FROM exams)
  );

CREATE POLICY "Members can manage exam tags" ON exam_tags
  FOR ALL USING (
    exam_id IN (SELECT id FROM exams)
  );

CREATE POLICY "Users can manage own exam attempts" ON exam_attempts
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Quiz exercises policies
CREATE POLICY "Users can view published quiz/exercises" ON quiz_exercises
  FOR SELECT USING (
    status = 'published' OR 
    auth.uid() IS NOT NULL OR
    (
      course_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM courses c 
        WHERE c.id = quiz_exercises.course_id 
          AND c.status = 'publish'
      )
    )
  );

CREATE POLICY "Members can create quiz/exercises" ON quiz_exercises
  FOR INSERT WITH CHECK (public.user_role() IN ('member', 'admin'));

CREATE POLICY "Members can update their own quiz/exercises" ON quiz_exercises
  FOR UPDATE USING (
    public.user_role() = 'admin' OR 
    (public.user_role() = 'member' AND created_by = auth.uid())
  );

CREATE POLICY "Members can delete their own quiz/exercises" ON quiz_exercises
  FOR DELETE USING (
    public.user_role() = 'admin' OR 
    (public.user_role() = 'member' AND created_by = auth.uid())
  );

-- Questions policies
CREATE POLICY "Users can view questions of accessible quiz/exercises" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_exercises qe 
      WHERE qe.id = questions.quiz_exercise_id 
        AND (qe.status = 'published' OR auth.uid() IS NOT NULL)
    )
  );

CREATE POLICY "Members can manage questions of their quiz/exercises" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quiz_exercises qe 
      WHERE qe.id = questions.quiz_exercise_id 
        AND (
          public.user_role() = 'admin' OR 
          (public.user_role() = 'member' AND qe.created_by = auth.uid())
        )
    )
  );

-- Answer options policies
CREATE POLICY "Users can view answer options" ON answer_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM questions q 
      JOIN quiz_exercises qe ON qe.id = q.quiz_exercise_id
      WHERE q.id = answer_options.question_id 
        AND (qe.status = 'published' OR auth.uid() IS NOT NULL)
    )
  );

CREATE POLICY "Members can manage answer options" ON answer_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM questions q
      JOIN quiz_exercises qe ON qe.id = q.quiz_exercise_id
      WHERE q.id = answer_options.question_id 
        AND (
          public.user_role() = 'admin' OR 
          (public.user_role() = 'member' AND qe.created_by = auth.uid())
        )
    )
  );

-- Quiz attempts policies
CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own quiz attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quiz attempts" ON quiz_attempts
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own quiz attempts" ON quiz_attempts
  FOR DELETE USING (user_id = auth.uid());

-- User answers policies
CREATE POLICY "Users can manage their own answers" ON user_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts qa 
      WHERE qa.id = user_answers.quiz_attempt_id 
        AND qa.user_id = auth.uid()
    )
  );

-- Quiz exercise tags policies
CREATE POLICY "Users can view quiz exercise tags" ON quiz_exercise_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_exercises qe 
      WHERE qe.id = quiz_exercise_tags.quiz_exercise_id 
        AND (qe.status = 'published' OR auth.uid() IS NOT NULL)
    )
  );

CREATE POLICY "Members can manage quiz exercise tags" ON quiz_exercise_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quiz_exercises qe 
      WHERE qe.id = quiz_exercise_tags.quiz_exercise_id 
        AND (
          public.user_role() = 'admin' OR 
          (public.user_role() = 'member' AND qe.created_by = auth.uid())
        )
    )
  );

-- Profile creation trigger for new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_country_id uuid;
  v_series_id uuid;
  v_role text;
  v_full_name text;
BEGIN
  v_country_id := NULLIF(NEW.raw_user_meta_data->>'country_id', '')::uuid;
  v_series_id := NULLIF(NEW.raw_user_meta_data->>'series_id', '')::uuid;
  v_role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'user');
  v_full_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), '');

  IF v_role <> 'user' THEN
    v_series_id := NULL;
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    country_id,
    series_id,
    role,
    status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_country_id,
    v_series_id,
    v_role,
    'active',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grants for authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
