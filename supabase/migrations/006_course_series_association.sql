-- Add course-series association table for many-to-many relationship
CREATE TABLE course_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE NOT NULL,
  relevance_notes TEXT, -- Optional notes about why this course is relevant for this series
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, series_id)
);

-- Add index for performance
CREATE INDEX idx_course_series_course ON course_series(course_id);
CREATE INDEX idx_course_series_series ON course_series(series_id);

-- Add some helpful views for course queries
CREATE VIEW course_details AS
SELECT 
  c.*,
  s.name as subject_name,
  s.color as subject_color,
  s.icon as subject_icon,
  p.full_name as author_name,
  COALESCE(array_agg(DISTINCT ser.name) FILTER (WHERE ser.name IS NOT NULL), '{}') as series_names,
  COALESCE(array_agg(DISTINCT co.name) FILTER (WHERE co.name IS NOT NULL), '{}') as country_names
FROM courses c
LEFT JOIN subjects s ON c.subject_id = s.id
LEFT JOIN profiles p ON c.created_by = p.id
LEFT JOIN course_series cs ON c.id = cs.course_id
LEFT JOIN series ser ON cs.series_id = ser.id
LEFT JOIN countries co ON ser.country_id = co.id
GROUP BY c.id, s.name, s.color, s.icon, p.full_name;

-- Create a comprehensive filtering view
CREATE VIEW searchable_courses AS
SELECT 
  cd.*,
  COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as tag_names
FROM course_details cd
LEFT JOIN course_tags ct ON cd.id = ct.course_id
LEFT JOIN tags t ON ct.tag_id = t.id
GROUP BY cd.id, cd.title, cd.description, cd.content, cd.pdf_url, cd.pdf_filename, 
         cd.video_url, cd.subject_id, cd.difficulty_level, cd.estimated_duration, 
         cd.status, cd.view_count, cd.created_by, cd.created_at, cd.updated_at,
         cd.subject_name, cd.subject_color, cd.subject_icon, cd.author_name,
         cd.series_names, cd.country_names;
