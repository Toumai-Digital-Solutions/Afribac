-- Topics taxonomy for courses
-- Allows subjects to be broken down into finer-grained topics/chapters

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  series_id UUID REFERENCES series(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  position INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, slug)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_topics_subject_name ON topics(subject_id, LOWER(name));
CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_series ON topics(series_id);

-- Ensure updated_at stays fresh
CREATE TRIGGER update_topics_updated_at
BEFORE UPDATE ON topics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add topic association to courses
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES topics(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_courses_topic ON courses(topic_id);

-- Update course views to surface topic information
DROP VIEW IF EXISTS searchable_courses;
DROP VIEW IF EXISTS course_details;

CREATE VIEW course_details AS
SELECT 
  c.*,
  topic.name AS topic_name,
  topic.slug AS topic_slug,
  topic.position AS topic_position,
  subj.name AS subject_name,
  subj.color AS subject_color,
  subj.icon AS subject_icon,
  p.full_name AS author_name,
  COALESCE(array_agg(DISTINCT ser.id) FILTER (WHERE ser.id IS NOT NULL), '{}')::uuid[] AS series_ids,
  COALESCE(array_agg(DISTINCT ser.name) FILTER (WHERE ser.name IS NOT NULL), '{}') AS series_names,
  COALESCE(array_agg(DISTINCT co.id) FILTER (WHERE co.id IS NOT NULL), '{}')::uuid[] AS country_ids,
  COALESCE(array_agg(DISTINCT co.name) FILTER (WHERE co.name IS NOT NULL), '{}') AS country_names
FROM courses c
LEFT JOIN subjects subj ON c.subject_id = subj.id
LEFT JOIN topics topic ON c.topic_id = topic.id
LEFT JOIN profiles p ON c.created_by = p.id
LEFT JOIN course_series cs ON c.id = cs.course_id
LEFT JOIN series ser ON cs.series_id = ser.id
LEFT JOIN countries co ON ser.country_id = co.id
GROUP BY 
  c.id,
  topic.name,
  topic.slug,
  topic.position,
  subj.name,
  subj.color,
  subj.icon,
  p.full_name;

CREATE VIEW searchable_courses AS
SELECT 
  cd.*,
  COALESCE(array_agg(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL), '{}')::uuid[] AS tag_ids,
  COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tag_names
FROM course_details cd
LEFT JOIN course_tags ct ON cd.id = ct.course_id
LEFT JOIN tags t ON ct.tag_id = t.id
GROUP BY 
  cd.id,
  cd.title,
  cd.description,
  cd.content,
  cd.pdf_url,
  cd.pdf_filename,
  cd.video_url,
  cd.subject_id,
  cd.topic_id,
  cd.topic_name,
  cd.topic_slug,
  cd.topic_position,
  cd.difficulty_level,
  cd.estimated_duration,
  cd.status,
  cd.view_count,
  cd.created_by,
  cd.created_at,
  cd.updated_at,
  cd.subject_name,
  cd.subject_color,
  cd.subject_icon,
  cd.author_name,
  cd.series_ids,
  cd.series_names,
  cd.country_ids,
  cd.country_names;

-- RLS for topics
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view topics" ON topics
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Members and admins manage topics" ON topics
  FOR ALL USING (public.user_role() IN ('member', 'admin'))
  WITH CHECK (public.user_role() IN ('member', 'admin'));
