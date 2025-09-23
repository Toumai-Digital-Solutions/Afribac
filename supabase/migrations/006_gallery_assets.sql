-- Create storage bucket for gallery assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-assets', 'gallery-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Gallery assets table
CREATE TABLE gallery_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('image', 'latex')),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_path TEXT,
  latex_content TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT gallery_assets_payload_check CHECK (
    (type = 'image' AND file_path IS NOT NULL AND latex_content IS NULL) OR
    (type = 'latex' AND latex_content IS NOT NULL)
  )
);

CREATE INDEX idx_gallery_assets_type ON gallery_assets(type);
CREATE INDEX idx_gallery_assets_created_at ON gallery_assets(created_at DESC);

CREATE TRIGGER trg_gallery_assets_updated_at
BEFORE UPDATE ON gallery_assets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE gallery_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gallery assets readable" ON gallery_assets
  FOR SELECT USING (public.user_role() IN ('admin', 'member'));

CREATE POLICY "Gallery assets insert" ON gallery_assets
  FOR INSERT WITH CHECK (public.user_role() IN ('admin', 'member'));

CREATE POLICY "Gallery assets update" ON gallery_assets
  FOR UPDATE USING (public.user_role() IN ('admin', 'member'))
  WITH CHECK (public.user_role() IN ('admin', 'member'));

CREATE POLICY "Gallery assets delete" ON gallery_assets
  FOR DELETE USING (public.user_role() IN ('admin', 'member'));

-- Storage policies for gallery bucket
CREATE POLICY "Gallery bucket read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'gallery-assets' AND public.user_role() IN ('admin', 'member')
  );

CREATE POLICY "Gallery bucket insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gallery-assets' AND public.user_role() IN ('admin', 'member')
  );

CREATE POLICY "Gallery bucket update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'gallery-assets' AND public.user_role() IN ('admin', 'member')
  );

CREATE POLICY "Gallery bucket delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gallery-assets' AND public.user_role() IN ('admin', 'member')
  );
