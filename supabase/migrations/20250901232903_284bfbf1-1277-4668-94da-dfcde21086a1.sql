-- Migration: Fix site_drafts table structure for compliance
-- 2025-09-02_site_drafts_fix.sql

-- Add missing columns if they don't exist
ALTER TABLE public.site_drafts ADD COLUMN IF NOT EXISTS website_id text;
ALTER TABLE public.site_drafts ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'created';
ALTER TABLE public.site_drafts ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE public.site_drafts ADD COLUMN IF NOT EXISTS pages_meta jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.site_drafts ADD COLUMN IF NOT EXISTS colors jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.site_drafts ADD COLUMN IF NOT EXISTS fonts jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION public.touch_updated_at() 
RETURNS trigger AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger to ensure it works
DROP TRIGGER IF EXISTS trg_site_drafts_updated ON public.site_drafts;
CREATE TRIGGER trg_site_drafts_updated
  BEFORE UPDATE ON public.site_drafts 
  FOR EACH ROW 
  EXECUTE FUNCTION public.touch_updated_at();

-- Ensure RLS is enabled
ALTER TABLE public.site_drafts ENABLE ROW LEVEL SECURITY;

-- Create policy for anon insertion if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='site_drafts' AND policyname='public_draft_insert'
  ) THEN
    CREATE POLICY public_draft_insert ON public.site_drafts 
      FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

-- Set proper permissions
REVOKE ALL ON public.site_drafts FROM anon;
GRANT INSERT ON public.site_drafts TO anon;