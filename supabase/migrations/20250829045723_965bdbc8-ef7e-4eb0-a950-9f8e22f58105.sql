-- Cancel the trial subscription to allow unique constraint
UPDATE public.subscriptions 
SET status = 'canceled', updated_at = now()
WHERE user_id = 'f4cd783e-93af-4d6a-a21f-be19c7d1df2b' 
  AND status = 'trialing'
  AND stripe_subscription_id IS NULL;