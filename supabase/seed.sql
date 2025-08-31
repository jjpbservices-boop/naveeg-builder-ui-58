-- Seed data for plans
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

-- Update Stripe price IDs (to be filled in with actual Stripe price IDs)
-- UPDATE public.plans SET stripe_price_id = 'price_starter_id' WHERE id = 'starter';
-- UPDATE public.plans SET stripe_price_id = 'price_pro_id' WHERE id = 'pro';
-- UPDATE public.plans SET stripe_price_id = 'price_enterprise_id' WHERE id = 'enterprise';