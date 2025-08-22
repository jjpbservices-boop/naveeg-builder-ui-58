-- Create sites table for storing website generation data
CREATE TABLE public.sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  business_type text NOT NULL,
  business_name text NOT NULL,
  business_description text NOT NULL,
  seo_title text,
  seo_description text,
  seo_keyphrase text,
  colors jsonb,
  fonts jsonb,
  pages_meta jsonb,
  website_type text DEFAULT 'basic',
  website_id int,
  unique_id text,
  site_url text,
  admin_url text,
  status text DEFAULT 'created',
  payload jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create events table for tracking the generation process
CREATE TABLE public.events (
  id bigserial PRIMARY KEY,
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE,
  label text NOT NULL,
  data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create read-only policies (Edge Functions will write with service role)
CREATE POLICY "Anyone can read sites" ON public.sites FOR SELECT USING (true);
CREATE POLICY "Anyone can read events" ON public.events FOR SELECT USING (true);

-- Create function to update timestamps automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();