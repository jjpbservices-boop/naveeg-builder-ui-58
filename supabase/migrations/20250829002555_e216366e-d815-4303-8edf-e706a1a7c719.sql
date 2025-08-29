-- Fix stripe_prices column mapping
ALTER TABLE public.stripe_prices RENAME COLUMN id TO price_id;

-- Add unique constraint on stripe_subscription_id
CREATE UNIQUE INDEX IF NOT EXISTS ux_subs_stripe_id ON public.subscriptions(stripe_subscription_id);

-- Add metadata column if it doesn't exist
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS metadata JSONB;