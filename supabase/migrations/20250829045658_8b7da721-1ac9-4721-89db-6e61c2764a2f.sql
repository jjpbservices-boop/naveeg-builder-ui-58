-- Update older active subscription to canceled status
UPDATE public.subscriptions 
SET status = 'canceled', updated_at = now()
WHERE user_id = 'f4cd783e-93af-4d6a-a21f-be19c7d1df2b' 
  AND stripe_subscription_id = 'sub_1S1KFlLXX1akeSeEqKQEN3of'
  AND status = 'active';