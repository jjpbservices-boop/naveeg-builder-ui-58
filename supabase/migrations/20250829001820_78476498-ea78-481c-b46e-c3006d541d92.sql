-- Create subscription plans table
CREATE TABLE public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER, -- in cents, null for custom plan
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create stripe prices mapping table
CREATE TABLE public.stripe_prices (
  id TEXT PRIMARY KEY, -- Stripe price ID
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  status TEXT NOT NULL, -- trialing, active, past_due, canceled
  trial_end TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for plans (public read)
CREATE POLICY "Plans are publicly readable" ON public.plans
FOR SELECT USING (true);

-- RLS policies for stripe_prices (public read)
CREATE POLICY "Stripe prices are publicly readable" ON public.stripe_prices
FOR SELECT USING (true);

-- RLS policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all subscriptions" ON public.subscriptions
FOR ALL USING (true);

-- Insert plan data
INSERT INTO public.plans (id, name, price, description) VALUES
('starter', 'Starter', 4900, 'Perfect for getting started'),
('pro', 'Pro', 9900, 'Everything you need to grow'),
('custom', 'Custom', NULL, 'Enterprise-grade power and dedicated support');

-- Insert stripe price mappings
INSERT INTO public.stripe_prices (id, plan_id) VALUES
('prod_Sx9geCTA0hSxT9', 'starter'),
('prod_Sx9geCTA0hSxT9', 'pro');

-- Create trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();