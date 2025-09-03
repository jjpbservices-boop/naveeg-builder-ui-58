-- Migration: Create site_perf table for PSI data
-- 2025-09-02_site_perf.sql

CREATE TABLE IF NOT EXISTS public.site_perf (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  strategy text NOT NULL CHECK (strategy IN ('mobile','desktop')),
  analysis_ts timestamptz NOT NULL,
  performance_score numeric,
  crux jsonb,
  lhr jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_site_perf_site_strategy ON public.site_perf(site_id, strategy);

-- Enable RLS and restrict access
ALTER TABLE public.site_perf ENABLE ROW LEVEL SECURITY;

-- Write via service role only
REVOKE ALL ON public.site_perf FROM anon, authenticated;