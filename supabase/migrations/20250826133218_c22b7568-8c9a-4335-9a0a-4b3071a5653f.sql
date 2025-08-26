-- Fix critical security issues

-- 1. Fix database functions security by setting proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END;
$function$;

CREATE OR REPLACE FUNCTION public._tg_user_websites_autolink()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO public.user_websites(user_id, website_id, role)
    VALUES (NEW.user_id, NEW.id, 'owner')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. Enable RLS on user_websites table and add proper policies
ALTER TABLE public.user_websites ENABLE ROW LEVEL SECURITY;

-- Create policies for user_websites - users can only see their own relationships
CREATE POLICY "Users can view their own website relationships" 
ON public.user_websites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own website relationships" 
ON public.user_websites 
FOR ALL
USING (auth.uid() = user_id);

-- 3. Remove conflicting public policies from sites table
DROP POLICY IF EXISTS "Anyone can insert sites" ON public.sites;
DROP POLICY IF EXISTS "Anyone can read sites" ON public.sites;  
DROP POLICY IF EXISTS "Anyone can update sites" ON public.sites;

-- 4. Secure events table - only site owners can access their analytics
DROP POLICY IF EXISTS "Anyone can insert events" ON public.events;
DROP POLICY IF EXISTS "Anyone can read events" ON public.events;

-- Create secure events policies
CREATE POLICY "Site owners can view their analytics events"
ON public.events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = events.site_id 
    AND sites.user_id = auth.uid()
  )
);

CREATE POLICY "Analytics services can insert events"
ON public.events
FOR INSERT
WITH CHECK (true); -- Allow analytics collection from public visitors

-- 5. Create security function for checking site ownership
CREATE OR REPLACE FUNCTION public.user_owns_site(site_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sites
    WHERE id = site_uuid 
    AND user_id = auth.uid()
  );
$$;