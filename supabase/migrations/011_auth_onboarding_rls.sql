-- Allow authenticated users to browse countries and series for onboarding
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'countries' AND policyname = 'Authenticated users can view countries'
  ) THEN
    CREATE POLICY "Authenticated users can view countries" ON public.countries
      FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'series' AND policyname = 'Authenticated users can view series'
  ) THEN
    CREATE POLICY "Authenticated users can view series" ON public.series
      FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

