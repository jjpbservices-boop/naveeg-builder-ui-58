-- Migration: Update site_drafts table structure for 10Web compliance
-- First ensure site_drafts exists with proper structure
CREATE TABLE IF NOT EXISTS public.site_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brief jsonb NOT NULL,
  pages_meta jsonb NOT NULL DEFAULT '[]'::jsonb,
  colors jsonb NOT NULL DEFAULT '{}'::jsonb,
  fonts jsonb NOT NULL DEFAULT '{}'::jsonb,
  region text NOT NULL DEFAULT 'europe-west3',
  subdomain text NOT NULL,
  website_id text,
  status text NOT NULL DEFAULT 'created',
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_drafts ENABLE ROW LEVEL SECURITY;

-- Create policy for public draft insertion
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

-- Revoke unnecessary permissions
REVOKE ALL ON public.site_drafts FROM anon;
GRANT INSERT ON public.site_drafts TO anon;

-- Create site_perf table for PSI data
CREATE TABLE IF NOT EXISTS public.site_perf (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  strategy text NOT NULL CHECK (strategy IN ('mobile','desktop')),
  analysis_ts timestamptz NOT NULL,
  performance_score numeric,
  crux jsonb,
  lhr jsonb, -- raw PSI lighthouseResult subset
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_site_perf_site_strategy ON public.site_perf(site_id, strategy);

-- Enable RLS and restrict access
ALTER TABLE public.site_perf ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.site_perf FROM anon, authenticated;