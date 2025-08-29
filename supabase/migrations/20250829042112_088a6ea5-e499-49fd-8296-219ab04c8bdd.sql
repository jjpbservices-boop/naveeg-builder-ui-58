-- Enhanced create_trial_subscription function with better logging and duplicate prevention
CREATE OR REPLACE FUNCTION public.create_trial_subscription(p_user_id uuid, p_site_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  trial_subscription_id UUID;
  existing_count INTEGER;
BEGIN
  -- Enhanced duplicate checking - count all subscriptions for this user/site combo
  SELECT COUNT(*) INTO existing_count
  FROM public.subscriptions 
  WHERE user_id = p_user_id AND site_id = p_site_id;
  
  -- If any subscription exists, return the most recent one
  IF existing_count > 0 THEN
    SELECT id INTO trial_subscription_id 
    FROM public.subscriptions 
    WHERE user_id = p_user_id AND site_id = p_site_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    RAISE LOG 'Subscription already exists for user % and site %, returning existing ID: %', p_user_id, p_site_id, trial_subscription_id;
    RETURN trial_subscription_id;
  END IF;

  -- Additional check for recent trial abuse (user creating too many trials)
  SELECT COUNT(*) INTO existing_count
  FROM public.subscriptions 
  WHERE user_id = p_user_id 
    AND status = 'trialing'
    AND created_at > (NOW() - INTERVAL '6 hours');
    
  IF existing_count >= 3 THEN
    RAISE LOG 'User % has created % trials in last 6 hours, blocking new trial for site %', p_user_id, existing_count, p_site_id;
    RAISE EXCEPTION 'Trial creation rate limit exceeded';
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
    'starter',
    'trialing',
    (NOW() + INTERVAL '7 days'),
    (NOW() + INTERVAL '7 days'),
    NULL,
    NULL,
    jsonb_build_object('trial_created_at', NOW(), 'created_via', 'webhook')
  )
  RETURNING id INTO trial_subscription_id;

  RAISE LOG 'Successfully created new trial subscription % for user % and site %', trial_subscription_id, p_user_id, p_site_id;
  RETURN trial_subscription_id;
END;
$function$;