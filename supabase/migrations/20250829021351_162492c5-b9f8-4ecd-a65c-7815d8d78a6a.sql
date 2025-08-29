-- Fix security warning by setting proper search_path for the function
CREATE OR REPLACE FUNCTION public.create_trial_subscription(
  p_user_id UUID,
  p_site_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  trial_subscription_id UUID;
BEGIN
  -- Check if user already has a subscription for this site
  IF EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = p_user_id AND site_id = p_site_id
  ) THEN
    -- Return existing subscription ID
    SELECT id INTO trial_subscription_id 
    FROM public.subscriptions 
    WHERE user_id = p_user_id AND site_id = p_site_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    RETURN trial_subscription_id;
  END IF;

  -- Create new trial subscription
  INSERT INTO public.subscriptions (
    user_id,
    site_id,
    plan_id,
    status,
    trial_end,
    current_period_end,
    stripe_customer_id,
    stripe_subscription_id,
    metadata
  ) VALUES (
    p_user_id,
    p_site_id,
    'starter', -- Default to starter plan for trial
    'trialing',
    (NOW() + INTERVAL '7 days'), -- 7-day trial
    (NOW() + INTERVAL '7 days'),
    NULL, -- No Stripe data yet
    NULL, -- No Stripe data yet
    jsonb_build_object('trial_created_at', NOW())
  )
  RETURNING id INTO trial_subscription_id;

  RETURN trial_subscription_id;
END;
$$;