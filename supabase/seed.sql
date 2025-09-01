-- Seed data for Naveeg DMS
-- File: supabase/seed.sql

-- Insert starter and pro plans
insert into public.plans (id, name, price_cents, currency, features) values
('starter', 'Starter', 0, 'eur', '["basic hosting", "email support"]'::jsonb),
('pro', 'Pro', 1900, 'eur', '["custom domain", "priority support"]'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  price_cents = excluded.price_cents,
  features = excluded.features;