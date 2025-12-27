-- ============================================
-- AI CONFIGURATION & LOGGING
-- Admin-configurable AI settings and usage tracking
-- ============================================

-- ============================================
-- AI SETTINGS TABLE
-- ============================================

-- AI settings for configurable model parameters
CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  provider TEXT NOT NULL,
  model_name TEXT NOT NULL,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_output_tokens INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ai_settings
CREATE INDEX IF NOT EXISTS idx_ai_settings_key ON ai_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_ai_settings_active ON ai_settings(is_active);

-- Trigger for updated_at
CREATE TRIGGER update_ai_settings_updated_at
  BEFORE UPDATE ON ai_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AI USAGE LOGS TABLE
-- ============================================

-- AI usage logs for tracking all AI operations
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_type TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  model_name TEXT NOT NULL,
  -- Request details
  prompt_summary TEXT,
  -- Response details
  status TEXT NOT NULL,
  error_message TEXT,
  -- Usage metrics
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  processing_time_ms INTEGER,
  -- Context
  reference_type TEXT,
  reference_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ai_usage_logs (optimized for common queries)
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_service ON ai_usage_logs(service_type);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_status ON ai_usage_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_provider ON ai_usage_logs(provider);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_date ON ai_usage_logs(user_id, created_at DESC);

-- ============================================
-- RLS POLICIES - AI SETTINGS
-- ============================================

ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Admins can read all settings
DROP POLICY IF EXISTS "Admins can read AI settings" ON ai_settings;
CREATE POLICY "Admins can read AI settings"
  ON ai_settings
  FOR SELECT
  TO authenticated
  USING (public.user_role() = 'admin');

-- Admins can update settings
DROP POLICY IF EXISTS "Admins can update AI settings" ON ai_settings;
CREATE POLICY "Admins can update AI settings"
  ON ai_settings
  FOR UPDATE
  TO authenticated
  USING (public.user_role() = 'admin');

-- Admins can insert settings
DROP POLICY IF EXISTS "Admins can insert AI settings" ON ai_settings;
CREATE POLICY "Admins can insert AI settings"
  ON ai_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.user_role() = 'admin');

-- Admins can delete settings
DROP POLICY IF EXISTS "Admins can delete AI settings" ON ai_settings;
CREATE POLICY "Admins can delete AI settings"
  ON ai_settings
  FOR DELETE
  TO authenticated
  USING (public.user_role() = 'admin');

-- ============================================
-- RLS POLICIES - AI USAGE LOGS
-- ============================================

ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read all logs
DROP POLICY IF EXISTS "Admins can read AI logs" ON ai_usage_logs;
CREATE POLICY "Admins can read AI logs"
  ON ai_usage_logs
  FOR SELECT
  TO authenticated
  USING (public.user_role() = 'admin');

-- Authenticated users can insert logs (API will create logs)
DROP POLICY IF EXISTS "Authenticated users can insert AI logs" ON ai_usage_logs;
CREATE POLICY "Authenticated users can insert AI logs"
  ON ai_usage_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Prevent updates (immutable logs)
DROP POLICY IF EXISTS "No updates to AI logs" ON ai_usage_logs;
CREATE POLICY "No updates to AI logs"
  ON ai_usage_logs
  FOR UPDATE
  TO authenticated
  USING (false);

-- Admins can delete old logs if needed
DROP POLICY IF EXISTS "Admins can delete AI logs" ON ai_usage_logs;
CREATE POLICY "Admins can delete AI logs"
  ON ai_usage_logs
  FOR DELETE
  TO authenticated
  USING (public.user_role() = 'admin');

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default configurations
INSERT INTO ai_settings (setting_key, provider, model_name, temperature, max_output_tokens, description)
VALUES
  ('copilot', 'gemini', 'gemini-2.0-flash', 0.7, 50, 'AI Copilot pour assistance aux cours'),
  ('extraction', 'gemini', 'gemini-2-0-flash-exp', 0.2, 4096, 'Extraction et traitement OCR des PDF')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE ai_settings IS 'Configuration for AI models and parameters';
COMMENT ON TABLE ai_usage_logs IS 'Audit trail of all AI operations with usage metrics';
