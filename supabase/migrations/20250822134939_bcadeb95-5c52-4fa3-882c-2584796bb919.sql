-- Create sites table (if not exists)
CREATE TABLE IF NOT EXISTS public.sites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  site_url text,
  email text,
  business_type text NOT NULL,
  business_name text NOT NULL,
  business_description text NOT NULL,
  seo_title text,
  seo_description text,
  seo_keyphrase text,
  admin_url text,
  status text DEFAULT 'created',
  owner_email text,
  website_type text DEFAULT 'basic',
  unique_id text,
  colors jsonb,
  fonts jsonb,
  pages_meta jsonb,
  website_id integer,
  payload jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create events table (if not exists)
CREATE TABLE IF NOT EXISTS public.events (
  id bigserial PRIMARY KEY,
  site_id uuid,
  label text NOT NULL,
  data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for sites table
DROP POLICY IF EXISTS "Anyone can read sites" ON public.sites;
CREATE POLICY "Anyone can read sites" ON public.sites FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert sites" ON public.sites;
CREATE POLICY "Anyone can insert sites" ON public.sites FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update sites" ON public.sites;
CREATE POLICY "Anyone can update sites" ON public.sites FOR UPDATE USING (true);

-- Create policies for events table
DROP POLICY IF EXISTS "Anyone can read events" ON public.events;
CREATE POLICY "Anyone can read events" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert events" ON public.events;
CREATE POLICY "Anyone can insert events" ON public.events FOR INSERT WITH CHECK (true);

-- Create trigger for updated_at on sites table
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sites_updated_at ON public.sites;
CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();