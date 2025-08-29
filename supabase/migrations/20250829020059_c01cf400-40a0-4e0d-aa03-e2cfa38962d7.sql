-- Update starter plan with correct price ID
UPDATE stripe_prices 
SET price_id = 'price_1S1FMELXX1akeSeESWOl8ujF' 
WHERE plan_id = 'starter';