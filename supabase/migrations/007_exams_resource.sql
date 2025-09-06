-- Create exams table with question and correction content
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Content sections
  questions_content TEXT, -- Rich text/markdown for exam questions
  correction_content TEXT, -- Rich text/markdown for corrections/solutions
  
  -- File attachments
  questions_pdf_url TEXT, -- URL for questions PDF
  questions_pdf_filename TEXT,
  correction_pdf_url TEXT, -- URL for corrections PDF  
  correction_pdf_filename TEXT,
  
  -- Exam metadata
  exam_type TEXT NOT NULL CHECK (exam_type IN ('baccalaureat', 'school_exam', 'mock_exam', 'practice_test', 'other')),
  exam_year INTEGER, -- Year of the exam (e.g., 2023)
  exam_session TEXT, -- e.g., 'Juin 2023', 'Session normale', 'Session de rattrapage'
  duration_minutes INTEGER DEFAULT 180, -- Exam duration in minutes
  total_points DECIMAL(5,2), -- Total points/score for the exam
  
  -- Associations (required - not flexible like courses)
  subject_id UUID REFERENCES subjects(id) NOT NULL,
  series_id UUID REFERENCES series(id) NOT NULL,
  
  -- Status and visibility
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  difficulty_level INTEGER DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5),
  
  -- Metadata
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam tags association (for additional categorization)
CREATE TABLE exam_tags (
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (exam_id, tag_id)
);

-- User exam progress/attempts (for future features)
CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  score DECIMAL(5,2), -- User's score
  is_completed BOOLEAN DEFAULT FALSE,
  answers JSONB, -- Store user answers (for future interactive features)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_exams_subject ON exams(subject_id);
CREATE INDEX idx_exams_series ON exams(series_id);
CREATE INDEX idx_exams_type_year ON exams(exam_type, exam_year);
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exam_attempts_user ON exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_exam ON exam_attempts(exam_id);

-- Create comprehensive view for exam listing
CREATE VIEW exam_details AS
SELECT 
  e.*,
  s.name as subject_name,
  s.color as subject_color,
  s.icon as subject_icon,
  ser.name as series_name,
  c.name as country_name,
  p.full_name as author_name,
  COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as tag_names
FROM exams e
LEFT JOIN subjects s ON e.subject_id = s.id
LEFT JOIN series ser ON e.series_id = ser.id
LEFT JOIN countries c ON ser.country_id = c.id
LEFT JOIN profiles p ON e.created_by = p.id
LEFT JOIN exam_tags et ON e.id = et.exam_id
LEFT JOIN tags t ON et.tag_id = t.id
GROUP BY e.id, s.name, s.color, s.icon, ser.name, c.name, p.full_name;

-- Update triggers
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_attempts_updated_at BEFORE UPDATE ON exam_attempts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: Exam materials will use the existing 'course-materials' bucket
-- with folder structure: exams/subject-name-exam-id/ (grouped by exam)
-- Example: exams/francais-230434834834/question.pdf, correction.pdf, etc.
-- No additional storage setup needed - using existing infrastructure
