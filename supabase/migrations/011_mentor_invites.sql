-- Create mentor invite status enum
CREATE TYPE mentor_invite_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- Create mentor relationship type enum
CREATE TYPE mentor_relationship AS ENUM ('parent', 'tutor', 'teacher', 'mentor', 'other');

-- Create mentor invites table
CREATE TABLE mentor_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_email TEXT NOT NULL,
  mentor_name TEXT,
  relationship mentor_relationship NOT NULL DEFAULT 'mentor',
  status mentor_invite_status NOT NULL DEFAULT 'pending',
  invite_token UUID UNIQUE DEFAULT uuid_generate_v4(),
  mentor_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Permissions
  can_view_progress BOOLEAN DEFAULT TRUE,
  can_view_courses BOOLEAN DEFAULT TRUE,
  can_receive_reports BOOLEAN DEFAULT FALSE,

  -- Timestamps
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique active invite per student-email pair
  CONSTRAINT unique_active_invite UNIQUE (student_id, mentor_email)
);

-- Create indexes
CREATE INDEX idx_mentor_invites_student ON mentor_invites(student_id);
CREATE INDEX idx_mentor_invites_mentor_email ON mentor_invites(mentor_email);
CREATE INDEX idx_mentor_invites_mentor_profile ON mentor_invites(mentor_profile_id);
CREATE INDEX idx_mentor_invites_status ON mentor_invites(status);
CREATE INDEX idx_mentor_invites_token ON mentor_invites(invite_token);

-- Add updated_at trigger
CREATE TRIGGER update_mentor_invites_updated_at
  BEFORE UPDATE ON mentor_invites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE mentor_invites ENABLE ROW LEVEL SECURITY;

-- Students can view and manage their own invites
CREATE POLICY "Students can view own invites" ON mentor_invites
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own invites" ON mentor_invites
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own invites" ON mentor_invites
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Students can delete own invites" ON mentor_invites
  FOR DELETE USING (auth.uid() = student_id);

-- Mentors can view invites sent to their email
CREATE POLICY "Mentors can view invites by token" ON mentor_invites
  FOR SELECT USING (
    mentor_profile_id = auth.uid() OR
    mentor_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Mentors can respond to invites
CREATE POLICY "Mentors can update invites sent to them" ON mentor_invites
  FOR UPDATE USING (
    mentor_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Admins can view all invites
CREATE POLICY "Admins can view all invites" ON mentor_invites
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Comments for documentation
COMMENT ON TABLE mentor_invites IS 'Stores parent/mentor invitations from students';
COMMENT ON COLUMN mentor_invites.invite_token IS 'Unique token for invite link sharing';
COMMENT ON COLUMN mentor_invites.can_receive_reports IS 'Whether mentor receives weekly progress reports';
