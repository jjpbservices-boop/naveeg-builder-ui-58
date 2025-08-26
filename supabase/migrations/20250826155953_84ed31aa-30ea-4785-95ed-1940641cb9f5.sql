-- Disable email confirmation requirement
-- This allows users to sign up and immediately sign in without email verification
UPDATE auth.config 
SET raw_base_config = jsonb_set(
  COALESCE(raw_base_config, '{}'::jsonb),
  '{MAILER_SECURE_EMAIL_CHANGE_ENABLED}',
  'false'
) 
WHERE instance_id = '00000000-0000-0000-0000-000000000000';

UPDATE auth.config 
SET raw_base_config = jsonb_set(
  COALESCE(raw_base_config, '{}'::jsonb),
  '{ENABLE_CONFIRMATIONS}',
  'false'
) 
WHERE instance_id = '00000000-0000-0000-0000-000000000000';