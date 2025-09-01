-- ========================================
-- Naveeg Supabase Schema Migration (Fixed)
-- Clean & Functional Production Setup
-- ========================================

-- 1) SCHEMA ALIGNMENT - Add missing columns if not exist

-- site_drafts table adjustments
DO $$ 
BEGIN
  -- Add missing columns to site_drafts
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_drafts' AND column_name='website_id') THEN
    ALTER TABLE public.site_drafts ADD COLUMN website_id text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_drafts' AND column_name='brief') THEN
    ALTER TABLE public.site_drafts ADD COLUMN brief jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_drafts' AND column_name='colors') THEN
    ALTER TABLE public.site_drafts ADD COLUMN colors jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_drafts' AND column_name='fonts') THEN
    ALTER TABLE public.site_drafts ADD COLUMN fonts jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_drafts' AND column_name='pages_meta') THEN
    ALTER TABLE public.site_drafts ADD COLUMN pages_meta jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_drafts' AND column_name='region') THEN
    ALTER TABLE public.site_drafts ADD COLUMN region text NOT NULL DEFAULT 'europe-west3-a';
  END IF;
END $$;

-- sites table adjustments  
DO $$
BEGIN
  -- Add missing columns to sites
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sites' AND column_name='region') THEN
    ALTER TABLE public.sites ADD COLUMN region text NOT NULL DEFAULT 'europe-west3-a';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sites' AND column_name='brief') THEN
    ALTER TABLE public.sites ADD COLUMN brief jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sites' AND column_name='colors') THEN
    ALTER TABLE public.sites ADD COLUMN colors jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sites' AND column_name='fonts') THEN
    ALTER TABLE public.sites ADD COLUMN fonts jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sites' AND column_name='pages_meta') THEN
    ALTER TABLE public.sites ADD COLUMN pages_meta jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sites' AND column_name='website_title') THEN
    ALTER TABLE public.sites ADD COLUMN website_title text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sites' AND column_name='website_keyphrase') THEN
    ALTER TABLE public.sites ADD COLUMN website_keyphrase text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sites' AND column_name='website_description') THEN
    ALTER TABLE public.sites ADD COLUMN website_description text;
  END IF;
  
  -- Convert tenweb_website_id to text if it's integer
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sites' AND column_name='tenweb_website_id' AND data_type='integer') THEN
    ALTER TABLE public.sites ALTER COLUMN tenweb_website_id TYPE text USING tenweb_website_id::text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sites' AND column_name='tenweb_website_id') THEN
    ALTER TABLE public.sites ADD COLUMN tenweb_website_id text;
  END IF;
END $$;

-- subscriptions table adjustments
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='plan') THEN
    ALTER TABLE public.subscriptions ADD COLUMN plan text NOT NULL DEFAULT 'starter';
  END IF;
END $$;

-- 2) FIX EXISTING DATA ISSUES

-- Clean up empty/null subdomains in sites table before adding unique constraint
UPDATE public.sites SET subdomain = 'site-' || LOWER(REPLACE(id::text, '-', '')) 
WHERE subdomain IS NULL OR subdomain = '' OR TRIM(subdomain) = '';

-- 3) INDICES AND CONSTRAINTS

-- Unique constraint for one site per user
CREATE UNIQUE INDEX IF NOT EXISTS uniq_sites_user ON public.sites(user_id);

-- Make subdomain unique in sites (now that we've cleaned the data)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_sites_subdomain ON public.sites(subdomain) WHERE subdomain IS NOT NULL AND subdomain != '';

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_site_drafts_subdomain ON public.site_drafts(subdomain);
CREATE INDEX IF NOT EXISTS idx_sites_user ON public.sites(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);

-- 4) UPDATED_AT TRIGGERS

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_site_drafts_updated_at ON public.site_drafts;
CREATE TRIGGER update_site_drafts_updated_at
  BEFORE UPDATE ON public.site_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sites_updated_at ON public.sites;
CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) RLS POLICIES

-- Enable RLS on all tables
ALTER TABLE public.site_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- site_drafts policies (public insert for onboarding)
DROP POLICY IF EXISTS "public_insert_site_drafts" ON public.site_drafts;
CREATE POLICY "public_insert_site_drafts" ON public.site_drafts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "owner_select_site_drafts" ON public.site_drafts;
CREATE POLICY "owner_select_site_drafts" ON public.site_drafts
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "owner_update_site_drafts" ON public.site_drafts;
CREATE POLICY "owner_update_site_drafts" ON public.site_drafts
  FOR UPDATE USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "owner_delete_site_drafts" ON public.site_drafts;
CREATE POLICY "owner_delete_site_drafts" ON public.site_drafts
  FOR DELETE USING (user_id IS NULL OR auth.uid() = user_id);

-- sites policies (no direct insert, only via function)
DROP POLICY IF EXISTS "owner_select_sites" ON public.sites;
CREATE POLICY "owner_select_sites" ON public.sites
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "owner_update_sites" ON public.sites;
CREATE POLICY "owner_update_sites" ON public.sites
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "owner_delete_sites" ON public.sites;
CREATE POLICY "owner_delete_sites" ON public.sites
  FOR DELETE USING (auth.uid() = user_id);

-- Block direct inserts to sites (only via function)
DROP POLICY IF EXISTS "no_direct_insert_sites" ON public.sites;
CREATE POLICY "no_direct_insert_sites" ON public.sites
  FOR INSERT WITH CHECK (false);

-- subscriptions policies
DROP POLICY IF EXISTS "owner_select_subscriptions" ON public.subscriptions;
CREATE POLICY "owner_select_subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- 6) PROMOTE DRAFT TO SITE FUNCTION

CREATE OR REPLACE FUNCTION public.promote_draft_to_site(
  p_draft_id  uuid,
  p_user_id   uuid,
  p_subdomain text,
  p_region    text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_site_id uuid;
  d record;
BEGIN
  -- Get the draft
  SELECT * INTO d FROM public.site_drafts WHERE id = p_draft_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'draft % not found', p_draft_id;
  END IF;

  -- Enforce one site per user
  IF EXISTS (SELECT 1 FROM public.sites s WHERE s.user_id = p_user_id) THEN
    RAISE EXCEPTION 'user % already has a site', p_user_id;
  END IF;

  -- Insert into sites
  INSERT INTO public.sites (
    user_id, subdomain, region, status,
    brief, colors, fonts,
    website_title, website_keyphrase, website_description,
    pages_meta, tenweb_website_id, created_at, updated_at
  )
  VALUES (
    p_user_id, 
    p_subdomain, 
    COALESCE(p_region, 'europe-west3-a'), 
    'provisioning',
    COALESCE(d.brief, '{}'::jsonb), 
    d.colors, 
    d.fonts,
    d.website_title, 
    d.website_keyphrase, 
    d.website_description,
    COALESCE(d.pages_meta, '[]'::jsonb), 
    d.website_id, 
    now(), 
    now()
  )
  RETURNING id INTO v_site_id;

  -- Clean up the draft
  DELETE FROM public.site_drafts WHERE id = p_draft_id;

  RETURN v_site_id;
END;
$$;

-- Grant permissions for the function
REVOKE ALL ON FUNCTION public.promote_draft_to_site(uuid,uuid,text,text) FROM public;
GRANT EXECUTE ON FUNCTION public.promote_draft_to_site(uuid,uuid,text,text) TO authenticated, service_role;

-- 7) SECURITY - Revoke direct insert on sites
REVOKE INSERT ON public.sites FROM public;
REVOKE INSERT ON public.sites FROM authenticated;