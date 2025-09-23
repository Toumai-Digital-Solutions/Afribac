-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE content_type_enum AS ENUM ('quiz', 'exercise');
CREATE TYPE question_type_enum AS ENUM ('single_choice', 'multiple_choice', 'true_false', 'short_answer');

-- Countries table
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  flag_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Series table (academic series per country)
CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  country_id UUID REFERENCES countries(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, country_id)
);

-- Subjects table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'book',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Association between series and subjects (with coefficients)
CREATE TABLE series_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES series(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  coefficient INTEGER DEFAULT 1 CHECK (coefficient > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(series_id, subject_id)
);

-- Tags for organizing content
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'topic' CHECK (type IN ('chapter', 'topic', 'difficulty', 'exam_type', 'school')),
  color TEXT DEFAULT '#64748B',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles extending Supabase auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'member', 'admin')),
  country_id UUID REFERENCES countries(id),
  series_id UUID REFERENCES series(id),
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_student_series CHECK (
    (
      role = 'user' AND (
        series_id IS NOT NULL OR country_id IS NULL
      )
    ) OR (
      role IN ('member', 'admin') AND series_id IS NULL
    )
  )
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  pdf_url TEXT,
  pdf_filename TEXT,
  video_url TEXT,
  subject_id UUID REFERENCES subjects(id) NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_duration INTEGER DEFAULT 30,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'publish', 'archived')),
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Association between courses and tags
CREATE TABLE course_tags (
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (course_id, tag_id)
);

-- Course / series association
CREATE TABLE course_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE NOT NULL,
  relevance_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, series_id)
);

-- User progress tracking
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  time_spent INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_completed BOOLEAN DEFAULT FALSE,
  bookmarks JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Exams
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  questions_content TEXT,
  correction_content TEXT,
  questions_pdf_url TEXT,
  questions_pdf_filename TEXT,
  correction_pdf_url TEXT,
  correction_pdf_filename TEXT,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('baccalaureat', 'school_exam', 'mock_exam', 'practice_test', 'other')),
  exam_year INTEGER,
  exam_session TEXT,
  duration_minutes INTEGER DEFAULT 180,
  total_points DECIMAL(5,2),
  subject_id UUID REFERENCES subjects(id) NOT NULL,
  series_id UUID REFERENCES series(id) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  difficulty_level INTEGER DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5),
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE exam_tags (
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (exam_id, tag_id)
);

CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  score DECIMAL(5,2),
  is_completed BOOLEAN DEFAULT FALSE,
  answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz & exercises
CREATE TABLE quiz_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content_type content_type_enum NOT NULL,
  subject_id UUID REFERENCES subjects(id) NOT NULL,
  series_id UUID REFERENCES series(id) NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_duration INTEGER DEFAULT 30,
  instructions TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_exercise_id UUID REFERENCES quiz_exercises(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type question_type_enum NOT NULL,
  points INTEGER DEFAULT 1,
  explanation TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE answer_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_exercise_id UUID REFERENCES quiz_exercises(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER DEFAULT 0,
  max_score INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_taken INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  selected_options UUID[],
  text_answer TEXT,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quiz_exercise_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_exercise_id UUID REFERENCES quiz_exercises(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quiz_exercise_id, tag_id)
);

-- Indexes
CREATE INDEX idx_profiles_country ON profiles(country_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_series_country ON series(country_id);
CREATE INDEX idx_courses_subject ON courses(subject_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_course_series_course ON course_series(course_id);
CREATE INDEX idx_course_series_series ON course_series(series_id);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_course ON user_progress(course_id);
CREATE INDEX idx_exams_subject ON exams(subject_id);
CREATE INDEX idx_exams_series ON exams(series_id);
CREATE INDEX idx_exams_type_year ON exams(exam_type, exam_year);
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exam_attempts_user ON exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_exam ON exam_attempts(exam_id);
CREATE INDEX idx_quiz_exercises_subject_id ON quiz_exercises(subject_id);
CREATE INDEX idx_quiz_exercises_series_id ON quiz_exercises(series_id);
CREATE INDEX idx_quiz_exercises_course_id ON quiz_exercises(course_id);
CREATE INDEX idx_quiz_exercises_status ON quiz_exercises(status);
CREATE INDEX idx_quiz_exercises_content_type ON quiz_exercises(content_type);
CREATE INDEX idx_questions_quiz_exercise_id ON questions(quiz_exercise_id);
CREATE INDEX idx_questions_order_index ON questions(quiz_exercise_id, order_index);
CREATE INDEX idx_answer_options_question_id ON answer_options(question_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_exercise_id ON quiz_attempts(quiz_exercise_id);

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON series FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_updated_at BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_attempts_updated_at BEFORE UPDATE ON exam_attempts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quiz_exercises_updated_at BEFORE UPDATE ON quiz_exercises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for aggregated data
CREATE VIEW course_details AS
SELECT 
  c.*,
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
LEFT JOIN profiles p ON c.created_by = p.id
LEFT JOIN course_series cs ON c.id = cs.course_id
LEFT JOIN series ser ON cs.series_id = ser.id
LEFT JOIN countries co ON ser.country_id = co.id
GROUP BY c.id, subj.name, subj.color, subj.icon, p.full_name;

CREATE VIEW searchable_courses AS
SELECT 
  cd.*,
  COALESCE(array_agg(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL), '{}')::uuid[] AS tag_ids,
  COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tag_names
FROM course_details cd
LEFT JOIN course_tags ct ON cd.id = ct.course_id
LEFT JOIN tags t ON ct.tag_id = t.id
GROUP BY cd.id, cd.title, cd.description, cd.content, cd.pdf_url, cd.pdf_filename,
         cd.video_url, cd.subject_id, cd.difficulty_level, cd.estimated_duration,
         cd.status, cd.view_count, cd.created_by, cd.created_at, cd.updated_at,
         cd.subject_name, cd.subject_color, cd.subject_icon, cd.author_name,
         cd.series_ids, cd.series_names, cd.country_ids, cd.country_names;

CREATE VIEW exam_details AS
SELECT 
  e.*,
  s.name AS subject_name,
  s.color AS subject_color,
  s.icon AS subject_icon,
  ser.name AS series_name,
  c.name AS country_name,
  p.full_name AS author_name,
  COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tag_names
FROM exams e
LEFT JOIN subjects s ON e.subject_id = s.id
LEFT JOIN series ser ON e.series_id = ser.id
LEFT JOIN countries c ON ser.country_id = c.id
LEFT JOIN profiles p ON e.created_by = p.id
LEFT JOIN exam_tags et ON e.id = et.exam_id
LEFT JOIN tags t ON et.tag_id = t.id
GROUP BY e.id, s.name, s.color, s.icon, ser.name, c.name, p.full_name;

CREATE VIEW quiz_exercise_details AS
SELECT 
  qe.*,
  subj.name AS subject_name,
  subj.color AS subject_color,
  subj.icon AS subject_icon,
  ser.name AS series_name,
  co.name AS country_name,
  p.full_name AS author_name,
  course.title AS course_title,
  course.status AS course_status,
  COALESCE((SELECT COUNT(*) FROM questions WHERE quiz_exercise_id = qe.id), 0) AS question_count,
  COALESCE((SELECT SUM(points) FROM questions WHERE quiz_exercise_id = qe.id), 0) AS total_points,
  COALESCE(array_agg(DISTINCT t.name ORDER BY t.name) FILTER (WHERE t.name IS NOT NULL), ARRAY[]::text[]) AS tag_names
FROM quiz_exercises qe
LEFT JOIN subjects subj ON qe.subject_id = subj.id
LEFT JOIN series ser ON qe.series_id = ser.id
LEFT JOIN countries co ON ser.country_id = co.id
LEFT JOIN profiles p ON qe.created_by = p.id
LEFT JOIN courses course ON qe.course_id = course.id
LEFT JOIN quiz_exercise_tags qet ON qe.id = qet.quiz_exercise_id
LEFT JOIN tags t ON qet.tag_id = t.id
GROUP BY qe.id, subj.name, subj.color, subj.icon, ser.name, co.name, p.full_name, course.title, course.status;

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
  ) AS search_vector
FROM quiz_exercise_details qed;

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
  COALESCE((SELECT COUNT(*) FROM questions WHERE quiz_exercise_id = qe.id), 0) AS question_count,
  COALESCE((SELECT SUM(points) FROM questions WHERE quiz_exercise_id = qe.id), 0) AS total_points,
  subj.name AS subject_name,
  subj.color AS subject_color,
  subj.icon AS subject_icon
FROM quiz_exercises qe
LEFT JOIN subjects subj ON qe.subject_id = subj.id
WHERE qe.course_id IS NOT NULL
ORDER BY qe.created_at DESC;
