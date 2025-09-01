-- Create site_drafts table for onboarding flow
CREATE TABLE IF NOT EXISTS site_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id INTEGER NOT NULL UNIQUE,
  unique_id TEXT NOT NULL,
  brief JSONB NOT NULL,
  colors JSONB,
  fonts JSONB,
  website_title TEXT,
  website_keyphrase TEXT,
  website_description TEXT,
  pages_meta JSONB NOT NULL,
  subdomain TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_drafts ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS site_drafts_website_id_idx ON site_drafts(website_id);
CREATE INDEX IF NOT EXISTS site_drafts_unique_id_idx ON site_drafts(unique_id);

-- RLS Policies for site_drafts (allow public access during onboarding)
CREATE POLICY "Allow public access to site_drafts" ON site_drafts
  FOR ALL USING (true);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_site_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_drafts_updated_at
  BEFORE UPDATE ON site_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_site_drafts_updated_at();
