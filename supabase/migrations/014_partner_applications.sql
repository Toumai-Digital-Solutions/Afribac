-- Partner/Ambassador applications table
-- For educators interested in managing Afribac operations in their country

CREATE TABLE partner_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  profession TEXT NOT NULL,
  speciality TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX idx_partner_applications_status ON partner_applications(status);
CREATE INDEX idx_partner_applications_country ON partner_applications(country);
CREATE INDEX idx_partner_applications_email ON partner_applications(email);

-- Add trigger for updated_at
CREATE TRIGGER update_partner_applications_updated_at 
  BEFORE UPDATE ON partner_applications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;

-- Only admins can view applications
CREATE POLICY "Admins can view all applications" ON partner_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Anyone can insert (public form)
CREATE POLICY "Anyone can submit application" ON partner_applications
  FOR INSERT WITH CHECK (true);

-- Only admins can update
CREATE POLICY "Admins can update applications" ON partner_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Comment for documentation
COMMENT ON TABLE partner_applications IS 'Applications from educators interested in becoming Afribac country representatives';
