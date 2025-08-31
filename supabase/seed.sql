-- Seed data for plans and initial setup
-- File: supabase/seed.sql

-- Insert default plans
INSERT INTO public.plans (id, name, description, price, currency, interval, features, stripe_price_id, active) VALUES
('starter', 'Starter Plan', 'Perfect for individuals and small projects', 999, 'usd', 'month', 
 '["1 Website", "10GB Storage", "SSL Certificate", "Basic Support", "Website Analytics"]'::jsonb, 
 null, true),
('pro', 'Pro Plan', 'Ideal for growing businesses and agencies', 2999, 'usd', 'month', 
 '["5 Websites", "100GB Storage", "SSL Certificate", "Priority Support", "Advanced Analytics", "Custom Domain", "Backup & Restore"]'::jsonb, 
 null, true),
('enterprise', 'Enterprise', 'For large organizations with custom needs', 9999, 'usd', 'month', 
 '["Unlimited Websites", "1TB Storage", "SSL Certificate", "24/7 Dedicated Support", "Advanced Analytics", "Custom Domain", "Backup & Restore", "White Label", "API Access"]'::jsonb, 
 null, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  updated_at = now();

-- Sample events for testing
INSERT INTO public.events (event_type, event_data) VALUES
('system.migration_complete', '{"version": "20240101000000", "timestamp": "2024-01-01T00:00:00Z"}'),
('system.seed_data_inserted', '{"plans_count": 3, "timestamp": "2024-01-01T00:00:00Z"}');

-- TODO: Update these with actual Stripe price IDs from your Stripe dashboard
-- UPDATE public.plans SET stripe_price_id = 'price_starter_monthly' WHERE id = 'starter';
-- UPDATE public.plans SET stripe_price_id = 'price_pro_monthly' WHERE id = 'pro';
-- UPDATE public.plans SET stripe_price_id = 'price_enterprise_monthly' WHERE id = 'enterprise';