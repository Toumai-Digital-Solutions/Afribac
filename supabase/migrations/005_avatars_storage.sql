-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatars bucket

-- Anyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Users can upload avatars (own avatar + admin/member permissions)
CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    (
      -- Users can upload their own avatar
      auth.uid()::text = (storage.foldername(name))[1] OR
      -- Admins can upload any avatar
      public.user_role() = 'admin' OR
      -- Members can upload avatars for users in their country
      (
        public.user_role() = 'member' AND
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id::text = (storage.foldername(name))[1]
          AND p.country_id = public.user_country_id()
        )
      )
    )
  );

-- Users can update avatars (own avatar + admin/member permissions)
CREATE POLICY "Users can update avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    (
      -- Users can update their own avatar
      auth.uid()::text = (storage.foldername(name))[1] OR
      -- Admins can update any avatar
      public.user_role() = 'admin' OR
      -- Members can update avatars for users in their country
      (
        public.user_role() = 'member' AND
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id::text = (storage.foldername(name))[1]
          AND p.country_id = public.user_country_id()
        )
      )
    )
  );

-- Users can delete avatars (own avatar + admin/member permissions)
CREATE POLICY "Users can delete avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    (
      -- Users can delete their own avatar
      auth.uid()::text = (storage.foldername(name))[1] OR
      -- Admins can delete any avatar
      public.user_role() = 'admin' OR
      -- Members can delete avatars for users in their country
      (
        public.user_role() = 'member' AND
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id::text = (storage.foldername(name))[1]
          AND p.country_id = public.user_country_id()
        )
      )
    )
  );

-- Create RLS policy for the storage.buckets table to allow reading the bucket configuration
-- (This might already exist, so guard with a conditional block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'buckets'
      AND policyname = 'Users can read buckets'
  ) THEN
    CREATE POLICY "Users can read buckets" ON storage.buckets
      FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;
