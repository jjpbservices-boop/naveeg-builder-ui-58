-- Add user_id and owner_email columns to sites table
ALTER TABLE public.sites 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- Add index for better performance on user queries
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON public.sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_owner_email ON public.sites(owner_email);