-- Enable RLS on all tables
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS policies
CREATE OR REPLACE FUNCTION public.user_country_id() RETURNS UUID AS $$
  SELECT country_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.user_role() RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.user_series_id() RETURNS UUID AS $$
  SELECT series_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- COUNTRIES: Users can only see their own country, admins see all
CREATE POLICY "Users can view their own country" ON countries
  FOR SELECT USING (
    id = public.user_country_id() OR public.user_role() = 'admin'
  );

-- Only admins can manage countries
CREATE POLICY "Only admins can manage countries" ON countries
  FOR ALL USING (public.user_role() = 'admin');

-- SERIES: Read access based on user's country
CREATE POLICY "Users can view series from their country" ON series
  FOR SELECT USING (
    country_id = public.user_country_id() OR public.user_role() = 'admin'
  );

-- Only admins can manage series
CREATE POLICY "Only admins can manage series" ON series
  FOR ALL USING (public.user_role() = 'admin');

-- SUBJECTS: Read access for all authenticated users
CREATE POLICY "Authenticated users can view subjects" ON subjects
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can manage subjects
CREATE POLICY "Only admins can manage subjects" ON subjects
  FOR ALL USING (public.user_role() = 'admin');

-- SERIES_SUBJECTS: Read access based on user's country
CREATE POLICY "Users can view series-subjects from their country" ON series_subjects
  FOR SELECT USING (
    series_id IN (
      SELECT id FROM series WHERE country_id = public.user_country_id()
    ) OR public.user_role() = 'admin'
  );

-- Only admins can manage series-subjects relationships
CREATE POLICY "Only admins can manage series-subjects" ON series_subjects
  FOR ALL USING (public.user_role() = 'admin');

-- PROFILES: Users can view their own profile, members can view profiles from their country
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Members can view profiles from their country" ON profiles
  FOR SELECT USING (
    id = auth.uid() OR 
    (public.user_role() = 'member' AND country_id = public.user_country_id()) OR
    public.user_role() = 'admin'
  );

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid()) 
  WITH CHECK (id = auth.uid() AND role = public.user_role()); -- Prevent role escalation

-- Only admins can create/delete profiles and change roles
CREATE POLICY "Only admins can manage user roles" ON profiles
  FOR ALL USING (public.user_role() = 'admin');

-- COURSES: Complex RLS for country-based content access
CREATE POLICY "Users can view published courses from their country" ON courses
  FOR SELECT USING (
    CASE 
      WHEN public.user_role() = 'admin' THEN true
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
      ELSE false
    END
  );

-- Members can create courses for their country
CREATE POLICY "Members can create courses for their country" ON courses
  FOR INSERT WITH CHECK (
    public.user_role() IN ('member', 'admin') AND 
    (public.user_role() = 'admin' OR subject_id IN (
      SELECT ss.subject_id FROM series_subjects ss
      JOIN series s ON ss.series_id = s.id
      WHERE s.country_id = public.user_country_id()
    ))
  );

-- Members can update ANY course from their country (collaborative editing)
CREATE POLICY "Members can update any course from their country" ON courses
  FOR UPDATE USING (
    public.user_role() IN ('member', 'admin') AND 
    (public.user_role() = 'admin' OR subject_id IN (
      SELECT ss.subject_id FROM series_subjects ss
      JOIN series s ON ss.series_id = s.id
      WHERE s.country_id = public.user_country_id()
    ))
  );

-- Members can delete ANY course from their country (collaborative management)
CREATE POLICY "Members can delete any course from their country" ON courses
  FOR DELETE USING (
    public.user_role() IN ('member', 'admin') AND 
    (public.user_role() = 'admin' OR subject_id IN (
      SELECT ss.subject_id FROM series_subjects ss
      JOIN series s ON ss.series_id = s.id
      WHERE s.country_id = public.user_country_id()
    ))
  );

-- TAGS: Read for all, manage for members/admins
CREATE POLICY "Authenticated users can view tags" ON tags
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Members and admins can manage tags" ON tags
  FOR ALL USING (public.user_role() IN ('member', 'admin'));

-- COURSE_TAGS: Inherit from courses permissions
CREATE POLICY "Users can view course tags based on course access" ON course_tags
  FOR SELECT USING (
    course_id IN (SELECT id FROM courses) -- Will be filtered by courses RLS
  );

CREATE POLICY "Members can manage course tags for their courses" ON course_tags
  FOR ALL USING (
    course_id IN (SELECT id FROM courses) -- Will be filtered by courses RLS
  );

-- USER_PROGRESS: Users see own progress, members see progress from their country
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

-- Users can manage their own progress
CREATE POLICY "Users can manage own progress" ON user_progress
  FOR ALL USING (user_id = auth.uid());

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    (NEW.raw_user_meta_data->>'country_id')::UUID,
    (NEW.raw_user_meta_data->>'series_id')::UUID,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'active',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
