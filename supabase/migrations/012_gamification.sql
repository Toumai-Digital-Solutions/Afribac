-- ============================================
-- AFRIBAC GAMIFICATION SYSTEM
-- Points, Badges, Streaks, and Levels
-- ============================================

-- ============================================
-- POINTS SYSTEM
-- ============================================

-- Points action types
CREATE TYPE points_action_type AS ENUM (
  -- Course actions
  'course_started',
  'course_completed',
  'course_perfect_score',

  -- Quiz actions
  'quiz_completed',
  'quiz_passed',
  'quiz_perfect_score',

  -- Exam actions
  'exam_completed',
  'exam_passed',
  'exam_perfect_score',

  -- Streak actions
  'daily_streak_bonus',
  'weekly_streak_bonus',
  'streak_milestone',

  -- Challenge actions
  'challenge_completed',
  'challenge_won',

  -- Engagement actions
  'daily_login',
  'weekly_goal_met',
  'profile_completed',

  -- Special actions
  'badge_earned',
  'level_up',
  'referral_bonus',
  'admin_bonus'
);

-- Points configuration table (defines how many points each action gives)
CREATE TABLE points_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type points_action_type UNIQUE NOT NULL,
  base_points INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  -- Multipliers
  difficulty_multiplier BOOLEAN DEFAULT FALSE, -- multiply by difficulty level (1-5)
  score_multiplier BOOLEAN DEFAULT FALSE, -- multiply by score percentage
  streak_multiplier BOOLEAN DEFAULT FALSE, -- multiply by current streak
  -- Constraints
  max_per_day INTEGER, -- NULL = unlimited
  cooldown_minutes INTEGER, -- NULL = no cooldown
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Points ledger - tracks all point transactions
CREATE TABLE points_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action_type points_action_type NOT NULL,
  points INTEGER NOT NULL,
  -- Context
  reference_type TEXT, -- 'course', 'quiz', 'exam', 'challenge', etc.
  reference_id UUID,
  metadata JSONB DEFAULT '{}',
  -- Multipliers applied
  base_points INTEGER NOT NULL,
  multiplier DECIMAL(4,2) DEFAULT 1.0,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User points summary (materialized for performance)
CREATE TABLE user_points (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  points_this_week INTEGER DEFAULT 0,
  points_this_month INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  last_points_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LEVELS SYSTEM
-- ============================================

CREATE TABLE levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_number INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  min_points INTEGER NOT NULL,
  icon TEXT, -- emoji or icon name
  color TEXT, -- hex color
  perks JSONB DEFAULT '[]', -- array of perk descriptions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User levels
CREATE TABLE user_levels (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL DEFAULT 1 REFERENCES levels(level_number),
  current_xp INTEGER DEFAULT 0, -- XP within current level
  xp_to_next INTEGER DEFAULT 100, -- XP needed for next level
  level_up_count INTEGER DEFAULT 0,
  last_level_up_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BADGES SYSTEM
-- ============================================

-- Badge categories
CREATE TYPE badge_category AS ENUM (
  'progress',     -- Milestone badges (first course, 10 courses, etc.)
  'mastery',      -- Skill/subject mastery badges
  'consistency',  -- Streak and regularity badges
  'achievement',  -- Special achievement badges
  'community',    -- Social/community badges
  'seasonal'      -- Time-limited/event badges
);

-- Badge rarity
CREATE TYPE badge_rarity AS ENUM (
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary'
);

-- Badges definition table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- machine-readable code
  name TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description TEXT,
  description_fr TEXT,
  category badge_category NOT NULL,
  rarity badge_rarity NOT NULL DEFAULT 'common',
  icon TEXT NOT NULL, -- emoji or icon name
  color TEXT, -- hex color for badge border/background
  points_reward INTEGER DEFAULT 0, -- points awarded when earned
  -- Unlock criteria (stored as JSON for flexibility)
  criteria JSONB NOT NULL,
  -- Display
  is_hidden BOOLEAN DEFAULT FALSE, -- hidden until earned
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges (earned badges)
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Progress tracking (for progressive badges)
  progress INTEGER DEFAULT 100, -- percentage, 100 = fully earned
  current_value INTEGER, -- current progress value
  target_value INTEGER, -- target to earn badge
  -- Context
  metadata JSONB DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE, -- user can feature up to 3 badges
  UNIQUE(user_id, badge_id)
);

-- ============================================
-- STREAKS SYSTEM
-- ============================================

CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  -- Current streak
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  streak_start_date DATE,
  last_activity_date DATE,
  -- Weekly tracking
  weekly_streak INTEGER DEFAULT 0,
  weeks_in_a_row INTEGER DEFAULT 0,
  -- Freeze/recovery
  streak_freezes_available INTEGER DEFAULT 0,
  streak_freezes_used INTEGER DEFAULT 0,
  last_freeze_date DATE,
  -- Stats
  total_active_days INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily activity log (for streak calculation)
CREATE TABLE daily_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_date DATE NOT NULL,
  -- Activity metrics
  courses_viewed INTEGER DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  exams_completed INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  -- Counts as active day?
  is_active_day BOOLEAN DEFAULT FALSE, -- TRUE if minimum activity threshold met
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_date)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_points_ledger_user ON points_ledger(user_id);
CREATE INDEX idx_points_ledger_user_date ON points_ledger(user_id, created_at DESC);
CREATE INDEX idx_points_ledger_action ON points_ledger(action_type);
CREATE INDEX idx_user_points_total ON user_points(total_points DESC);
CREATE INDEX idx_user_points_week ON user_points(points_this_week DESC);

CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_rarity ON badges(rarity);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX idx_user_badges_earned ON user_badges(user_id, earned_at DESC);

CREATE INDEX idx_user_streaks_current ON user_streaks(current_streak DESC);
CREATE INDEX idx_user_streaks_longest ON user_streaks(longest_streak DESC);
CREATE INDEX idx_daily_activity_user_date ON daily_activity_log(user_id, activity_date DESC);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_points_config_updated_at
  BEFORE UPDATE ON points_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON user_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_levels_updated_at
  BEFORE UPDATE ON user_levels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_badges_updated_at
  BEFORE UPDATE ON badges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_activity_updated_at
  BEFORE UPDATE ON daily_activity_log
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE points_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity_log ENABLE ROW LEVEL SECURITY;

-- Points config - readable by all, editable by admin
CREATE POLICY "Points config readable by all" ON points_config FOR SELECT USING (true);
CREATE POLICY "Points config editable by admin" ON points_config FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Points ledger - users see their own
CREATE POLICY "Users see own points" ON points_ledger FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert points" ON points_ledger FOR INSERT WITH CHECK (true);

-- User points - users see their own, leaderboard public
CREATE POLICY "Users see own user_points" ON user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Leaderboard visible" ON user_points FOR SELECT USING (true);

-- Levels - readable by all
CREATE POLICY "Levels readable by all" ON levels FOR SELECT USING (true);
CREATE POLICY "Levels editable by admin" ON levels FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- User levels - users see their own
CREATE POLICY "Users see own level" ON user_levels FOR SELECT USING (auth.uid() = user_id);

-- Badges - all badges visible (for trophy case)
CREATE POLICY "Badges readable by all" ON badges FOR SELECT USING (true);
CREATE POLICY "Badges editable by admin" ON badges FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- User badges - users see their own
CREATE POLICY "Users see own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);

-- Streaks - users see their own
CREATE POLICY "Users see own streaks" ON user_streaks FOR SELECT USING (auth.uid() = user_id);

-- Daily activity - users see their own
CREATE POLICY "Users see own activity" ON daily_activity_log FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- SEED DATA: POINTS CONFIGURATION
-- ============================================

INSERT INTO points_config (action_type, base_points, description, difficulty_multiplier, score_multiplier, max_per_day) VALUES
-- Course actions
('course_started', 5, 'Points for starting a new course', FALSE, FALSE, 10),
('course_completed', 50, 'Points for completing a course', TRUE, FALSE, NULL),
('course_perfect_score', 25, 'Bonus for perfect course completion', FALSE, FALSE, NULL),

-- Quiz actions
('quiz_completed', 10, 'Points for completing any quiz', FALSE, FALSE, 20),
('quiz_passed', 20, 'Points for passing a quiz (60%+)', FALSE, FALSE, NULL),
('quiz_perfect_score', 50, 'Bonus for perfect quiz score', FALSE, FALSE, NULL),

-- Exam actions
('exam_completed', 30, 'Points for completing an exam', FALSE, FALSE, 5),
('exam_passed', 100, 'Points for passing an exam', TRUE, FALSE, NULL),
('exam_perfect_score', 200, 'Bonus for perfect exam score', FALSE, FALSE, NULL),

-- Streak actions
('daily_streak_bonus', 5, 'Daily bonus for maintaining streak', FALSE, FALSE, 1),
('weekly_streak_bonus', 50, 'Weekly bonus for 7-day streak', FALSE, FALSE, 1),
('streak_milestone', 100, 'Bonus for streak milestones (7, 14, 30, 60, 90 days)', FALSE, FALSE, NULL),

-- Challenge actions
('challenge_completed', 75, 'Points for completing a challenge', FALSE, FALSE, NULL),
('challenge_won', 150, 'Points for winning a challenge', FALSE, FALSE, NULL),

-- Engagement actions
('daily_login', 2, 'Points for daily login', FALSE, FALSE, 1),
('weekly_goal_met', 100, 'Points for meeting weekly study goal', FALSE, FALSE, 1),
('profile_completed', 50, 'One-time bonus for completing profile', FALSE, FALSE, 1),

-- Special actions
('badge_earned', 10, 'Points for earning any badge', FALSE, FALSE, NULL),
('level_up', 25, 'Points for leveling up', FALSE, FALSE, NULL),
('referral_bonus', 100, 'Points for successful referral', FALSE, FALSE, NULL),
('admin_bonus', 0, 'Manual admin bonus', FALSE, FALSE, NULL);

-- ============================================
-- SEED DATA: LEVELS
-- ============================================

INSERT INTO levels (level_number, name, name_fr, min_points, icon, color) VALUES
(1, 'Beginner', 'Débutant', 0, '🌱', '#10B981'),
(2, 'Learner', 'Apprenti', 100, '📚', '#3B82F6'),
(3, 'Student', 'Étudiant', 300, '✏️', '#6366F1'),
(4, 'Scholar', 'Érudit', 600, '🎓', '#8B5CF6'),
(5, 'Expert', 'Expert', 1000, '⭐', '#F59E0B'),
(6, 'Master', 'Maître', 1500, '🏆', '#EF4444'),
(7, 'Champion', 'Champion', 2500, '👑', '#EC4899'),
(8, 'Legend', 'Légende', 4000, '💎', '#14B8A6'),
(9, 'Elite', 'Élite', 6000, '🔥', '#F97316'),
(10, 'Genius', 'Génie', 10000, '🌟', '#FFD700');

-- ============================================
-- SEED DATA: BADGES
-- ============================================

-- Progress Badges
INSERT INTO badges (code, name, name_fr, description, description_fr, category, rarity, icon, points_reward, criteria, sort_order) VALUES
('first_course', 'First Steps', 'Premiers pas', 'Complete your first course', 'Terminez votre premier cours', 'progress', 'common', '👣', 10, '{"type": "courses_completed", "count": 1}', 1),
('courses_5', 'Getting Started', 'Bon départ', 'Complete 5 courses', 'Terminez 5 cours', 'progress', 'common', '📖', 25, '{"type": "courses_completed", "count": 5}', 2),
('courses_10', 'Dedicated Learner', 'Apprenant dévoué', 'Complete 10 courses', 'Terminez 10 cours', 'progress', 'uncommon', '📚', 50, '{"type": "courses_completed", "count": 10}', 3),
('courses_25', 'Knowledge Seeker', 'Chercheur de savoir', 'Complete 25 courses', 'Terminez 25 cours', 'progress', 'rare', '🎯', 100, '{"type": "courses_completed", "count": 25}', 4),
('courses_50', 'Course Master', 'Maître des cours', 'Complete 50 courses', 'Terminez 50 cours', 'progress', 'epic', '🏅', 200, '{"type": "courses_completed", "count": 50}', 5),
('courses_100', 'Century Club', 'Club des 100', 'Complete 100 courses', 'Terminez 100 cours', 'progress', 'legendary', '💯', 500, '{"type": "courses_completed", "count": 100}', 6),

-- Mastery Badges
('first_perfect', 'Perfectionist', 'Perfectionniste', 'Get a perfect score on any quiz', 'Obtenez un score parfait à un quiz', 'mastery', 'uncommon', '💯', 25, '{"type": "perfect_quizzes", "count": 1}', 10),
('perfect_5', 'Precision', 'Précision', 'Get 5 perfect scores', 'Obtenez 5 scores parfaits', 'mastery', 'rare', '🎯', 75, '{"type": "perfect_quizzes", "count": 5}', 11),
('perfect_10', 'Flawless', 'Sans faute', 'Get 10 perfect scores', 'Obtenez 10 scores parfaits', 'mastery', 'epic', '✨', 150, '{"type": "perfect_quizzes", "count": 10}', 12),
('subject_master', 'Subject Expert', 'Expert en matière', 'Complete all courses in a subject', 'Terminez tous les cours d''une matière', 'mastery', 'epic', '🧠', 200, '{"type": "subject_completed", "count": 1}', 13),
('exam_ace', 'Exam Ace', 'As des examens', 'Score 90%+ on 5 exams', 'Obtenez 90%+ à 5 examens', 'mastery', 'legendary', '🏆', 300, '{"type": "high_exam_scores", "count": 5, "min_score": 90}', 14),

-- Consistency Badges
('streak_3', 'Getting Warmed Up', 'Échauffement', 'Maintain a 3-day streak', 'Maintenez une série de 3 jours', 'consistency', 'common', '🔥', 15, '{"type": "streak", "days": 3}', 20),
('streak_7', 'One Week Strong', 'Une semaine forte', 'Maintain a 7-day streak', 'Maintenez une série de 7 jours', 'consistency', 'uncommon', '⭐', 50, '{"type": "streak", "days": 7}', 21),
('streak_14', 'Two Week Warrior', 'Guerrier de deux semaines', 'Maintain a 14-day streak', 'Maintenez une série de 14 jours', 'consistency', 'rare', '💪', 100, '{"type": "streak", "days": 14}', 22),
('streak_30', 'Monthly Master', 'Maître mensuel', 'Maintain a 30-day streak', 'Maintenez une série de 30 jours', 'consistency', 'epic', '🏆', 200, '{"type": "streak", "days": 30}', 23),
('streak_60', 'Dedication', 'Dédication', 'Maintain a 60-day streak', 'Maintenez une série de 60 jours', 'consistency', 'legendary', '👑', 400, '{"type": "streak", "days": 60}', 24),
('streak_100', 'Unstoppable', 'Inarrêtable', 'Maintain a 100-day streak', 'Maintenez une série de 100 jours', 'consistency', 'legendary', '💎', 1000, '{"type": "streak", "days": 100}', 25),
('weekly_goal_4', 'Goal Getter', 'Objectif atteint', 'Meet weekly goal 4 weeks in a row', 'Atteignez l''objectif 4 semaines de suite', 'consistency', 'rare', '🎯', 100, '{"type": "weekly_goals", "count": 4}', 26),
('early_bird', 'Early Bird', 'Lève-tôt', 'Study before 8 AM for 7 days', 'Étudiez avant 8h pendant 7 jours', 'consistency', 'uncommon', '🌅', 50, '{"type": "early_study", "days": 7}', 27),
('night_owl', 'Night Owl', 'Oiseau de nuit', 'Study after 10 PM for 7 days', 'Étudiez après 22h pendant 7 jours', 'consistency', 'uncommon', '🦉', 50, '{"type": "late_study", "days": 7}', 28),

-- Achievement Badges
('first_quiz', 'Quiz Taker', 'Passeur de quiz', 'Complete your first quiz', 'Terminez votre premier quiz', 'achievement', 'common', '❓', 10, '{"type": "quizzes_completed", "count": 1}', 30),
('quizzes_10', 'Quiz Enthusiast', 'Passionné de quiz', 'Complete 10 quizzes', 'Terminez 10 quiz', 'achievement', 'uncommon', '📝', 50, '{"type": "quizzes_completed", "count": 10}', 31),
('first_exam', 'Exam Ready', 'Prêt pour l''examen', 'Complete your first exam', 'Terminez votre premier examen', 'achievement', 'common', '📋', 20, '{"type": "exams_completed", "count": 1}', 32),
('study_10h', 'Dedicated', 'Dévoué', 'Study for 10 hours total', 'Étudiez 10 heures au total', 'achievement', 'uncommon', '⏰', 50, '{"type": "total_study_hours", "hours": 10}', 33),
('study_50h', 'Committed', 'Engagé', 'Study for 50 hours total', 'Étudiez 50 heures au total', 'achievement', 'rare', '📚', 150, '{"type": "total_study_hours", "hours": 50}', 34),
('study_100h', 'Scholar', 'Érudit', 'Study for 100 hours total', 'Étudiez 100 heures au total', 'achievement', 'epic', '🎓', 300, '{"type": "total_study_hours", "hours": 100}', 35),
('level_5', 'Rising Star', 'Étoile montante', 'Reach level 5', 'Atteignez le niveau 5', 'achievement', 'rare', '⭐', 100, '{"type": "level_reached", "level": 5}', 36),
('level_10', 'Elite Status', 'Statut d''élite', 'Reach level 10', 'Atteignez le niveau 10', 'achievement', 'legendary', '💎', 500, '{"type": "level_reached", "level": 10}', 37),
('points_1000', 'Thousand Club', 'Club des 1000', 'Earn 1000 total points', 'Gagnez 1000 points au total', 'achievement', 'rare', '🏅', 100, '{"type": "total_points", "points": 1000}', 38),
('points_5000', 'High Achiever', 'Grand réalisateur', 'Earn 5000 total points', 'Gagnez 5000 points au total', 'achievement', 'epic', '🏆', 250, '{"type": "total_points", "points": 5000}', 39),
('points_10000', 'Point Master', 'Maître des points', 'Earn 10000 total points', 'Gagnez 10000 points au total', 'achievement', 'legendary', '👑', 500, '{"type": "total_points", "points": 10000}', 40),

-- Community Badges (placeholders for future)
('profile_complete', 'Identity', 'Identité', 'Complete your profile 100%', 'Complétez votre profil à 100%', 'community', 'common', '👤', 25, '{"type": "profile_complete", "percent": 100}', 50),
('mentor_added', 'Supported', 'Accompagné', 'Add a parent or mentor', 'Ajoutez un parent ou mentor', 'community', 'common', '👨‍👩‍👧', 25, '{"type": "mentor_added", "count": 1}', 51);

-- ============================================
-- VIEWS
-- ============================================

-- Leaderboard view
CREATE VIEW leaderboard AS
SELECT
  p.id as user_id,
  p.full_name,
  p.avatar_url,
  p.country_id,
  p.series_id,
  COALESCE(up.total_points, 0) as total_points,
  COALESCE(up.points_this_week, 0) as points_this_week,
  COALESCE(ul.current_level, 1) as level,
  l.name_fr as level_name,
  l.icon as level_icon,
  COALESCE(us.current_streak, 0) as streak,
  (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = p.id) as badge_count
FROM profiles p
LEFT JOIN user_points up ON p.id = up.user_id
LEFT JOIN user_levels ul ON p.id = ul.user_id
LEFT JOIN levels l ON ul.current_level = l.level_number
LEFT JOIN user_streaks us ON p.id = us.user_id
WHERE p.status = 'active' AND p.role = 'user'
ORDER BY total_points DESC;

-- User gamification summary view
CREATE VIEW user_gamification_summary AS
SELECT
  p.id as user_id,
  COALESCE(up.total_points, 0) as total_points,
  COALESCE(up.points_this_week, 0) as points_this_week,
  COALESCE(up.lifetime_points, 0) as lifetime_points,
  COALESCE(ul.current_level, 1) as current_level,
  l.name_fr as level_name,
  l.icon as level_icon,
  l.color as level_color,
  COALESCE(ul.current_xp, 0) as current_xp,
  COALESCE(ul.xp_to_next, 100) as xp_to_next,
  COALESCE(us.current_streak, 0) as current_streak,
  COALESCE(us.longest_streak, 0) as longest_streak,
  us.streak_start_date,
  us.last_activity_date,
  (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = p.id) as badges_earned,
  (SELECT COUNT(*) FROM badges WHERE is_active = true) as badges_total
FROM profiles p
LEFT JOIN user_points up ON p.id = up.user_id
LEFT JOIN user_levels ul ON p.id = ul.user_id
LEFT JOIN levels l ON ul.current_level = l.level_number
LEFT JOIN user_streaks us ON p.id = us.user_id;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE points_config IS 'Configuration for how many points each action awards';
COMMENT ON TABLE points_ledger IS 'Complete history of all point transactions';
COMMENT ON TABLE user_points IS 'Aggregated user point totals for quick access';
COMMENT ON TABLE levels IS 'Level definitions with point thresholds';
COMMENT ON TABLE user_levels IS 'Current level status for each user';
COMMENT ON TABLE badges IS 'Badge definitions with unlock criteria';
COMMENT ON TABLE user_badges IS 'Badges earned by users';
COMMENT ON TABLE user_streaks IS 'User streak tracking';
COMMENT ON TABLE daily_activity_log IS 'Daily activity metrics for streak and stats calculation';
