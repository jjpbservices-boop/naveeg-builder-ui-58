-- Enable RLS on site_drafts table and create public insert policy
-- This allows onboarding to work without authentication

ALTER TABLE public.site_drafts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='site_drafts' AND policyname='public_draft_insert'
  ) THEN
    CREATE POLICY public_draft_insert ON public.site_drafts
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;
