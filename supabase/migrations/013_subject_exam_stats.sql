-- Subject-level exam submission statistics
-- Aggregates exam attempts by subject to show submission counts and average scores

-- Create view for user subject exam statistics
CREATE VIEW user_subject_exam_stats AS
SELECT 
  ea.user_id,
  e.subject_id,
  s.name AS subject_name,
  s.color AS subject_color,
  s.icon AS subject_icon,
  COUNT(ea.id) AS total_submissions,
  COUNT(ea.id) FILTER (WHERE ea.is_completed = true) AS completed_submissions,
  ROUND(AVG(ea.score) FILTER (WHERE ea.score IS NOT NULL), 2) AS average_score,
  ROUND(MAX(ea.score), 2) AS best_score,
  ROUND(MIN(ea.score) FILTER (WHERE ea.score IS NOT NULL), 2) AS lowest_score,
  SUM(ea.time_spent_minutes) AS total_time_spent_minutes,
  MAX(ea.submitted_at) AS last_submission_date
FROM exam_attempts ea
INNER JOIN exams e ON ea.exam_id = e.id
INNER JOIN subjects s ON e.subject_id = s.id
WHERE ea.is_completed = true
GROUP BY ea.user_id, e.subject_id, s.name, s.color, s.icon;

-- Enable RLS on the view (inherited from base tables)
ALTER VIEW user_subject_exam_stats SET (security_invoker = true);

-- Create index on exam_attempts for better performance
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_completed ON exam_attempts(user_id, is_completed) WHERE is_completed = true;
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_completed ON exam_attempts(exam_id, is_completed) WHERE is_completed = true;

-- Create a view for overall user exam statistics (across all subjects)
CREATE VIEW user_overall_exam_stats AS
SELECT 
  user_id,
  COUNT(DISTINCT subject_id) AS subjects_attempted,
  SUM(total_submissions) AS total_exam_submissions,
  SUM(completed_submissions) AS total_completed_exams,
  ROUND(AVG(average_score), 2) AS overall_average_score,
  SUM(total_time_spent_minutes) AS total_time_spent_minutes,
  MAX(last_submission_date) AS last_exam_date
FROM user_subject_exam_stats
GROUP BY user_id;

ALTER VIEW user_overall_exam_stats SET (security_invoker = true);

-- Comments for documentation
COMMENT ON VIEW user_subject_exam_stats IS 'Aggregated exam statistics per user and subject, showing submission counts, average scores, and time spent';
COMMENT ON VIEW user_overall_exam_stats IS 'Overall exam statistics per user across all subjects';
