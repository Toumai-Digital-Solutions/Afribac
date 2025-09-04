-- Create storage bucket for course materials (PDFs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', true);

-- RLS policies for storage bucket
CREATE POLICY "Authenticated users can view course materials" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'course-materials' AND 
    auth.uid() IS NOT NULL
  );

-- Members and admins can upload course materials
CREATE POLICY "Members can upload course materials" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'course-materials' AND 
    public.user_role() IN ('member', 'admin')
  );

-- Members can update/delete ANY materials from their country (collaborative management)
CREATE POLICY "Members can manage course materials from their country" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'course-materials' AND 
    (
      public.user_role() = 'admin' OR 
      (
        public.user_role() = 'member' AND
        -- Check if the file path starts with their country code
        -- Files organized as: country_code/subject/course_id/filename
        name LIKE (SELECT code FROM countries WHERE id = public.user_country_id()) || '/%'
      )
    )
  );

CREATE POLICY "Members can delete course materials from their country" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'course-materials' AND 
    (
      public.user_role() = 'admin' OR 
      (
        public.user_role() = 'member' AND
        -- Check if the file path starts with their country code
        name LIKE (SELECT code FROM countries WHERE id = public.user_country_id()) || '/%'
      )
    )
  );
