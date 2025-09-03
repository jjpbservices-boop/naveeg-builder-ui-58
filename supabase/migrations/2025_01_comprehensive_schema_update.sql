-- Comprehensive schema update for production-ready onboarding flow

-- Update site_drafts table to match requirements
ALTER TABLE site_drafts 
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS business_type TEXT,
  ADD COLUMN IF NOT EXISTS business_description TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'europe-west3-a',
  ADD COLUMN IF NOT EXISTS website_id TEXT,
  ADD COLUMN IF NOT EXISTS tenweb_website_id BIGINT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS message TEXT;

-- Migrate existing tenweb_website_id to website_id
UPDATE site_drafts
  SET website_id = COALESCE(website_id, tenweb_website_id::text)
WHERE tenweb_website_id IS NOT NULL AND website_id IS NULL;

-- Update existing columns to have proper defaults
ALTER TABLE site_drafts 
  ALTER COLUMN pages_meta SET DEFAULT '[]'::jsonb,
  ALTER COLUMN colors SET DEFAULT '{}'::jsonb,
  ALTER COLUMN fonts SET DEFAULT '{}'::jsonb;

-- Create site_perf table for PSI results
CREATE TABLE IF NOT EXISTS site_perf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL,
  strategy TEXT NOT NULL CHECK (strategy IN ('mobile', 'desktop')),
  analysis_ts TIMESTAMPTZ DEFAULT NOW(),
  performance_score NUMERIC,
  crux JSONB,
  lhr JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on site_perf
ALTER TABLE site_perf ENABLE ROW LEVEL SECURITY;

-- Create indexes for site_perf
CREATE INDEX IF NOT EXISTS site_perf_site_id_idx ON site_perf(site_id);
CREATE INDEX IF NOT EXISTS site_perf_strategy_idx ON site_perf(strategy);
CREATE INDEX IF NOT EXISTS site_perf_analysis_ts_idx ON site_perf(analysis_ts);

-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Allow public access to site_drafts" ON site_drafts;

-- Create proper RLS policies for site_drafts
-- Allow anonymous insert for onboarding only
CREATE POLICY IF NOT EXISTS "public_draft_insert" ON site_drafts
  FOR INSERT TO anon WITH CHECK (true);

-- Revoke all other permissions from anon
REVOKE ALL ON site_drafts FROM anon;
GRANT INSERT ON site_drafts TO anon;

-- Allow update by service role only
CREATE POLICY IF NOT EXISTS "Allow service role update" ON site_drafts
  FOR UPDATE USING (auth.role() = 'service_role');

-- RLS Policy for site_perf (service role only)
CREATE POLICY "Service role can manage site_perf" ON site_perf
  FOR ALL USING (auth.role() = 'service_role');

-- Add trigger to update updated_at on site_drafts
CREATE OR REPLACE FUNCTION update_site_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_site_drafts_updated_at ON site_drafts;

-- Create the trigger
CREATE TRIGGER update_site_drafts_updated_at
  BEFORE UPDATE ON site_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_site_drafts_updated_at();
