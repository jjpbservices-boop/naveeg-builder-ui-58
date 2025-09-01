-- Add tenweb_website_id field to sites table
ALTER TABLE sites ADD COLUMN IF NOT EXISTS tenweb_website_id INTEGER;

-- Create index for performance
CREATE INDEX IF NOT EXISTS sites_tenweb_website_id_idx ON sites(tenweb_website_id);

-- Update the unique constraint to allow multiple sites per user during onboarding
-- (we'll enforce one site per user in the application logic)
DROP INDEX IF EXISTS sites_owner_unique;
CREATE INDEX IF NOT EXISTS sites_owner_idx ON sites(owner);
