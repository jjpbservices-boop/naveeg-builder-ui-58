-- Comprehensive Supabase Schema Cleanup
-- This migration consolidates all tables and removes inconsistencies

-- 1. Drop duplicate/conflicting tables and recreate them cleanly
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.sites CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.analytics_snapshots CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.stripe_prices CASCADE;
DROP TABLE IF EXISTS public.site_drafts CASCADE;

-- 2. Create clean profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'custom')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create clean plans table
CREATE TABLE public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER, -- in cents, null for custom plan
  description TEXT,
  features JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create clean sites table
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tenweb_website_id INTEGER,
  domain TEXT,
  subdomain TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'online', 'archived')),
  brand_vibe TEXT,
  industry TEXT,
  goal TEXT,
  brief JSONB, -- Store the onboarding brief
  colors JSONB,
  fonts JSONB,
  website_title TEXT,
  website_description TEXT,
  region TEXT DEFAULT 'europe-west3',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create clean site_drafts table for onboarding
CREATE TABLE public.site_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenweb_website_id INTEGER,
  region TEXT DEFAULT 'europe-west3',
  slug TEXT,
  brief JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create clean subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  status TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'unpaid')),
  trial_end TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Create clean analytics_snapshots table
CREATE TABLE public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('psi', '10web')),
  lcp NUMERIC,
  cls NUMERIC,
  inp NUMERIC,
  performance NUMERIC,
  pagespeed_raw JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create stripe_prices mapping table
CREATE TABLE public.stripe_prices (
  id TEXT PRIMARY KEY, -- Stripe price ID
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_prices ENABLE ROW LEVEL SECURITY;

-- 10. Create proper RLS policies

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Plans: Public read access
CREATE POLICY "Plans are publicly readable" ON public.plans
  FOR SELECT USING (true);

-- Sites: Users can only access their own sites
CREATE POLICY "Users can view own sites" ON public.sites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sites" ON public.sites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sites" ON public.sites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sites" ON public.sites
  FOR DELETE USING (auth.uid() = user_id);

-- Site drafts: Public access during onboarding (no auth required)
CREATE POLICY "Allow public access to site_drafts" ON public.site_drafts
  FOR ALL USING (true);

-- Subscriptions: Users can only access their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics: Users can only access analytics for their own sites
CREATE POLICY "Users can view analytics for own sites" ON public.analytics_snapshots
  FOR SELECT USING (
    site_id IN (
      SELECT id FROM public.sites WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analytics for own sites" ON public.analytics_snapshots
  FOR INSERT WITH CHECK (
    site_id IN (
      SELECT id FROM public.sites WHERE user_id = auth.uid()
    )
  );

-- Stripe prices: Public read access
CREATE POLICY "Stripe prices are publicly readable" ON public.stripe_prices
  FOR SELECT USING (true);

-- 11. Create indexes for performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS sites_user_id_idx ON public.sites(user_id);
CREATE INDEX IF NOT EXISTS sites_tenweb_website_id_idx ON public.sites(tenweb_website_id);
CREATE INDEX IF NOT EXISTS sites_subdomain_idx ON public.sites(subdomain);
CREATE INDEX IF NOT EXISTS site_drafts_tenweb_website_id_idx ON public.site_drafts(tenweb_website_id);
CREATE INDEX IF NOT EXISTS site_drafts_slug_idx ON public.site_drafts(slug);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_site_id_idx ON public.subscriptions(site_id);
CREATE INDEX IF NOT EXISTS analytics_snapshots_site_id_idx ON public.analytics_snapshots(site_id);
CREATE INDEX IF NOT EXISTS analytics_snapshots_created_at_idx ON public.analytics_snapshots(created_at DESC);

-- 12. Insert default plans
INSERT INTO public.plans (id, name, price, description, features) VALUES
('starter', 'Starter', 4900, 'Perfect for getting started', '["1 Website", "10GB Storage", "SSL Certificate", "Basic Support", "Website Analytics"]'),
('pro', 'Pro', 9900, 'Everything you need to grow', '["5 Websites", "100GB Storage", "SSL Certificate", "Priority Support", "Advanced Analytics", "Custom Domain", "Backup & Restore"]'),
('custom', 'Custom', NULL, 'Enterprise-grade power and dedicated support', '["Unlimited Websites", "1TB Storage", "SSL Certificate", "24/7 Dedicated Support", "Advanced Analytics", "Custom Domain", "Backup & Restore", "White Label", "API Access"]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  features = EXCLUDED.features;

-- 13. Create utility functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 15. Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, plan)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'starter');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Create trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 17. Create function to create trial subscription
CREATE OR REPLACE FUNCTION public.create_trial_subscription(p_user_id UUID, p_site_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_subscription_id UUID;
BEGIN
  -- Create trial subscription
  INSERT INTO public.subscriptions (
    user_id, 
    site_id, 
    plan_id, 
    status, 
    trial_end, 
    current_period_end
  ) VALUES (
    p_user_id,
    p_site_id,
    'starter',
    'trialing',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days'
  ) RETURNING id INTO v_subscription_id;
  
  RETURN jsonb_build_object(
    'subscription_id', v_subscription_id,
    'status', 'trialing',
    'trial_end', NOW() + INTERVAL '14 days'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
