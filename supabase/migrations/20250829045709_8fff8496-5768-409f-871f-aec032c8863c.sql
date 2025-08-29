-- Add unique constraint to prevent multiple active subscriptions per user
CREATE UNIQUE INDEX idx_unique_active_subscription_per_user 
ON public.subscriptions (user_id) 
WHERE status IN ('active', 'trialing');