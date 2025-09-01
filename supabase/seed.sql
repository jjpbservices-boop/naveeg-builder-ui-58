-- Seed data for the clean Supabase schema
-- File: supabase/seed.sql

-- Insert default plans (these should match the cleanup migration)
INSERT INTO public.plans (id, name, price, description, features) VALUES
('starter', 'Starter', 4900, 'Perfect for getting started', '["1 Website", "10GB Storage", "SSL Certificate", "Basic Support", "Website Analytics"]'),
('pro', 'Pro', 9900, 'Everything you need to grow', '["5 Websites", "100GB Storage", "SSL Certificate", "Priority Support", "Advanced Analytics", "Custom Domain", "Backup & Restore"]'),
('custom', 'Custom', NULL, 'Enterprise-grade power and dedicated support', '["Unlimited Websites", "1TB Storage", "SSL Certificate", "24/7 Dedicated Support", "Advanced Analytics", "Custom Domain", "Backup & Restore", "White Label", "API Access"]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = now();

-- Insert sample stripe price mappings
INSERT INTO public.stripe_prices (id, plan_id) VALUES
('price_starter_monthly', 'starter'),
('price_pro_monthly', 'pro')
ON CONFLICT (id) DO NOTHING;

-- Note: Update these with actual Stripe price IDs from your Stripe dashboard
-- UPDATE public.stripe_prices SET id = 'price_starter_monthly' WHERE plan_id = 'starter';
-- UPDATE public.stripe_prices SET id = 'price_pro_monthly' WHERE plan_id = 'pro';

-- Sample data for testing (optional)
-- INSERT INTO public.profiles (id, email, full_name, plan) VALUES
--   (gen_random_uuid(), 'test@example.com', 'Test User', 'starter');

-- INSERT INTO public.sites (id, user_id, subdomain, status, brief) VALUES
--   (gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'test@example.com'), 'test-site', 'draft', '{"business_type": "test", "business_name": "Test Business"}');