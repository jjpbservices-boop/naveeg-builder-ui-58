#!/bin/bash

echo "🚀 Deploying Supabase project..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found. Please install it first:"
  echo "   npm install -g supabase"
  exit 1
fi

# Check if we're linked to a project
if [[ ! -f .supabase/config.toml ]]; then
  echo "❌ Not linked to a Supabase project. Run 'supabase link' first."
  exit 1
fi

echo "📊 Running database migrations..."
supabase db push

if [[ $? -ne 0 ]]; then
  echo "❌ Database migration failed"
  exit 1
fi

echo "🌱 Running database seed..."
supabase db seed

if [[ $? -ne 0 ]]; then
  echo "⚠️  Database seed failed (this might be expected if data already exists)"
fi

echo "🔧 Deploying edge functions..."
supabase functions deploy

if [[ $? -ne 0 ]]; then
  echo "❌ Edge functions deployment failed"
  exit 1
fi

echo "🔍 Checking function health..."
sleep 5

# Test health endpoints
echo "Testing billing function health..."
billing_health=$(curl -s -o /dev/null -w "%{http_code}" "$(supabase status | grep 'Edge Functions' | awk '{print $3}')/billing/health")

if [[ $billing_health -eq 200 ]]; then
  echo "✅ Billing function is healthy"
else
  echo "⚠️  Billing function health check failed (HTTP $billing_health)"
fi

echo "🎉 Supabase deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update your Stripe webhook URL in the Stripe dashboard"
echo "2. Run './scripts/verify-webhooks.sh' to test webhook connectivity"
echo "3. Test your application end-to-end"