-- Create enum types for quiz and exercise
CREATE TYPE content_type_enum AS ENUM ('quiz', 'exercise');
CREATE TYPE question_type_enum AS ENUM ('single_choice', 'multiple_choice', 'true_false', 'short_answer');

-- Quiz & Exercises main table
CREATE TABLE quiz_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content_type content_type_enum NOT NULL,
  subject_id UUID REFERENCES subjects(id) NOT NULL,
  series_id UUID REFERENCES series(id) NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_duration INTEGER DEFAULT 30, -- minutes
  instructions TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table (for both quiz and exercise)
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_exercise_id UUID REFERENCES quiz_exercises(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type question_type_enum NOT NULL,
  points INTEGER DEFAULT 1,
  explanation TEXT, -- For exercises: the solution/explanation
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Answer options (for quiz questions)
CREATE TABLE answer_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User quiz attempts (for interactive quizzes)
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_exercise_id UUID REFERENCES quiz_exercises(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER DEFAULT 0,
  max_score INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_taken INTEGER, -- seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User answers (for quiz attempts)
CREATE TABLE user_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  selected_options UUID[], -- Array of answer_option IDs
  text_answer TEXT, -- For short answer questions
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz/Exercise tags association
CREATE TABLE quiz_exercise_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_exercise_id UUID REFERENCES quiz_exercises(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quiz_exercise_id, tag_id)
);

-- Indexes for performance
CREATE INDEX idx_quiz_exercises_subject_id ON quiz_exercises(subject_id);
CREATE INDEX idx_quiz_exercises_series_id ON quiz_exercises(series_id);
CREATE INDEX idx_quiz_exercises_status ON quiz_exercises(status);
CREATE INDEX idx_quiz_exercises_content_type ON quiz_exercises(content_type);
CREATE INDEX idx_questions_quiz_exercise_id ON questions(quiz_exercise_id);
CREATE INDEX idx_questions_order_index ON questions(quiz_exercise_id, order_index);
CREATE INDEX idx_answer_options_question_id ON answer_options(question_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_exercise_id ON quiz_attempts(quiz_exercise_id);

-- RLS Policies
ALTER TABLE quiz_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_exercise_tags ENABLE ROW LEVEL SECURITY;

-- Quiz exercises policies
CREATE POLICY "Users can view published quiz/exercises" ON quiz_exercises
  FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);

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

-- Create a detailed view for quiz/exercises with all related data
CREATE VIEW quiz_exercise_details AS
SELECT 
  qe.*,
  s.name as subject_name,
  s.color as subject_color,
  s.icon as subject_icon,
  ser.name as series_name,
  c.name as country_name,
  p.full_name as author_name,
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
LEFT JOIN quiz_exercise_tags qet ON qe.id = qet.quiz_exercise_id
LEFT JOIN tags t ON qet.tag_id = t.id
GROUP BY qe.id, s.name, s.color, s.icon, ser.name, c.name, p.full_name;

-- Searchable view for filtering
CREATE VIEW searchable_quiz_exercises AS
SELECT 
  qed.*,
  (
    setweight(to_tsvector('french', COALESCE(qed.title, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(qed.description, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(qed.instructions, '')), 'C') ||
    setweight(to_tsvector('french', COALESCE(qed.subject_name, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(qed.series_name, '')), 'C')
  ) as search_vector
FROM quiz_exercise_details qed;

-- Update triggers
CREATE TRIGGER update_quiz_exercises_updated_at BEFORE UPDATE ON quiz_exercises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: Quiz/Exercise materials will use the existing 'course-materials' bucket
-- with folder structure: quiz-exercises/subject-name-quiz-id/ (grouped by quiz/exercise)
-- No additional storage setup needed - using existing infrastructure
