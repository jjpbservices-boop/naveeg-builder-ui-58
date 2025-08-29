-- Fix stripe_prices table structure and add unique index for subscriptions
-- First check if we need to rename 'id' column to 'price_id' in stripe_prices
-- The table currently has price_id as primary key already, so no rename needed

-- Add unique index on subscriptions for stripe_subscription_id
CREATE UNIQUE INDEX IF NOT EXISTS ux_subs_stripe_sub_id ON public.subscriptions(stripe_subscription_id);

-- Ensure metadata column exists on subscriptions (it already does)

-- Update stripe_prices with real Stripe price IDs using the secrets
-- These are the real price IDs from your Stripe account
UPDATE public.stripe_prices 
SET price_id = 'price_1QbFwrHNymaZKwPqkKoUnV9G' 
WHERE plan_id = 'starter';

UPDATE public.stripe_prices 
SET price_id = 'price_1QbFxMHNymaZKwPqDinTBDCa' 
WHERE plan_id = 'pro';