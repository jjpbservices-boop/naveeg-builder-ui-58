-- Update stripe_prices table with real price IDs from secrets
UPDATE public.stripe_prices 
SET price_id = 'price_1QbFwrHNymaZKwPqkKoUnV9G' 
WHERE plan_id = 'starter';

UPDATE public.stripe_prices 
SET price_id = 'price_1QbFxMHNymaZKwPqDinTBDCa' 
WHERE plan_id = 'pro';