-- Update stripe_prices table with correct price IDs
UPDATE stripe_prices 
SET price_id = 'price_1S1FSnLXX1akeSeEZ4Llnuh3' 
WHERE plan_id = 'starter';

UPDATE stripe_prices 
SET price_id = 'price_1S1FN8LXX1akeSeELhnjngG2' 
WHERE plan_id = 'pro';

-- Add unique constraint on stripe_subscription_id to prevent duplicate webhook processing
ALTER TABLE subscriptions 
ADD CONSTRAINT unique_stripe_subscription_id 
UNIQUE (stripe_subscription_id);