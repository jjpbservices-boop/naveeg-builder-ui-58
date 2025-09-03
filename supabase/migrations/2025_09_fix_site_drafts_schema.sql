-- Fix site_drafts table to allow null website_id
ALTER TABLE public.site_drafts ALTER COLUMN website_id DROP NOT NULL;

-- Ensure the table has all required columns with proper defaults
CREATE TABLE IF NOT EXISTS public.site_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brief jsonb NOT NULL,
  pages_meta jsonb NOT NULL DEFAULT '[]'::jsonb,
  colors jsonb NOT NULL DEFAULT '{}'::jsonb,
  fonts jsonb NOT NULL DEFAULT '{}'::jsonb,
  region text NOT NULL DEFAULT 'europe-west3',
  subdomain text NOT NULL,
  website_id text, -- Allow null for drafts
  status text NOT NULL DEFAULT 'draft',
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_site_drafts_updated ON public.site_drafts;
CREATE TRIGGER trg_site_drafts_updated 
  BEFORE UPDATE ON public.site_drafts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Enable RLS
ALTER TABLE public.site_drafts ENABLE ROW LEVEL SECURITY;

-- Create policy for anon insert
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

-- Grant permissions
GRANT INSERT ON public.site_drafts TO anon;
