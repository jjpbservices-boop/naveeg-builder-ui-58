-- Enable RLS
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'custom')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  domain TEXT,
  status TEXT DEFAULT 'generating' CHECK (status IN ('generating', 'online', 'draft')),
  brand_vibe TEXT NOT NULL,
  industry TEXT NOT NULL,
  goal TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'past_due', 'trialing', 'unpaid')),
  current_period_end TIMESTAMPTZ NOT NULL
);

-- Create analytics_snapshots table
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('psi', '10web')),
  lcp NUMERIC NOT NULL,
  cls NUMERIC NOT NULL,
  inp NUMERIC NOT NULL,
  performance NUMERIC NOT NULL,
  pagespeed_raw JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint: one site per user
CREATE UNIQUE INDEX IF NOT EXISTS sites_owner_unique ON sites(owner);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS sites_owner_idx ON sites(owner);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS analytics_snapshots_site_id_idx ON analytics_snapshots(site_id);
CREATE INDEX IF NOT EXISTS analytics_snapshots_created_at_idx ON analytics_snapshots(created_at DESC);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for sites
CREATE POLICY "Users can view own sites" ON sites
  FOR SELECT USING (auth.uid() = owner);

CREATE POLICY "Users can insert own sites" ON sites
  FOR INSERT WITH CHECK (auth.uid() = owner);

CREATE POLICY "Users can update own sites" ON sites
  FOR UPDATE USING (auth.uid() = owner);

CREATE POLICY "Users can delete own sites" ON sites
  FOR DELETE USING (auth.uid() = owner);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for analytics_snapshots
CREATE POLICY "Users can view analytics for own sites" ON analytics_snapshots
  FOR SELECT USING (
    site_id IN (
      SELECT id FROM sites WHERE owner = auth.uid()
    )
  );

CREATE POLICY "Users can insert analytics for own sites" ON analytics_snapshots
  FOR INSERT WITH CHECK (
    site_id IN (
      SELECT id FROM sites WHERE owner = auth.uid()
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, plan)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'starter');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
