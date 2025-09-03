-- Update site_drafts table to match requirements
ALTER TABLE site_drafts 
  ADD COLUMN IF NOT EXISTS tenweb_website_id TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'europe-west3-a',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'created',
  ADD COLUMN IF NOT EXISTS message TEXT;

-- Update existing columns to have proper defaults
ALTER TABLE site_drafts 
  ALTER COLUMN pages_meta SET DEFAULT '[]'::jsonb,
  ALTER COLUMN colors SET DEFAULT '{}'::jsonb,
  ALTER COLUMN fonts SET DEFAULT '{}'::jsonb;

-- Create site_perf table for performance data
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

-- RLS Policy for site_perf (service role only)
CREATE POLICY "Service role can manage site_perf" ON site_perf
  FOR ALL USING (auth.role() = 'service_role');
