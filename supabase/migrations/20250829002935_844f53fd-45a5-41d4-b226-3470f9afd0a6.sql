-- Add unique index for subscriptions table to support upsert
CREATE UNIQUE INDEX IF NOT EXISTS ux_subs_stripe ON public.subscriptions(stripe_subscription_id);

-- Ensure metadata column exists
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS metadata jsonb;