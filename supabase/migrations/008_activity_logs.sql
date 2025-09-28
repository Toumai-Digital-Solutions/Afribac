-- Activity logging to track admin/member actions

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL DEFAULT auth.uid(),
  actor_role TEXT DEFAULT public.user_role(),
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT,
  status TEXT DEFAULT 'success',
  note TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor ON activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);

-- View with actor details for easier querying
DROP VIEW IF EXISTS activity_log_details;
CREATE VIEW activity_log_details AS
SELECT
  l.*,
  p.full_name AS actor_name,
  p.email AS actor_email
FROM activity_logs l
LEFT JOIN profiles p ON p.id = l.actor_id;

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow admin and members to insert their own activity logs
DROP POLICY IF EXISTS "Members and admins can insert activity logs" ON activity_logs;
CREATE POLICY "Members and admins can insert activity logs"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.user_role() IN ('admin', 'member'));

-- Allow admins to read all logs
DROP POLICY IF EXISTS "Admins can read activity logs" ON activity_logs;
CREATE POLICY "Admins can read activity logs"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (public.user_role() = 'admin');

-- Allow admins to delete logs if needed
DROP POLICY IF EXISTS "Admins can delete activity logs" ON activity_logs;
CREATE POLICY "Admins can delete activity logs"
  ON activity_logs
  FOR DELETE
  TO authenticated
  USING (public.user_role() = 'admin');

-- Prevent updates (immutable logs)
DROP POLICY IF EXISTS "No update on activity logs" ON activity_logs;
CREATE POLICY "No update on activity logs"
  ON activity_logs
  FOR UPDATE
  TO authenticated
  USING (false);
