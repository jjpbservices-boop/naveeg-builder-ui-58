-- Create sites table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id integer,
  unique_id text,
  business_name text NOT NULL,
  business_description text NOT NULL,
  business_type text NOT NULL,
  website_type text DEFAULT 'basic',
  seo_title text,
  seo_description text,
  seo_keyphrase text,
  colors jsonb,
  fonts jsonb,
  pages_meta jsonb,
  owner_email text,
  admin_url text,
  site_url text,
  status text DEFAULT 'created',
  is_generating boolean DEFAULT false,
  user_id uuid,
  payload jsonb,
  email text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth is implemented yet)
CREATE POLICY "Anyone can insert sites" 
ON public.sites 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can read sites" 
ON public.sites 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update sites" 
ON public.sites 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sites_updated_at
BEFORE UPDATE ON public.sites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();