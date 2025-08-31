#!/bin/bash

echo "🔒 Verifying webhook configurations..."

# Check if curl is available
if ! command -v curl &> /dev/null; then
  echo "❌ curl not found. Please install curl to run webhook verification."
  exit 1
fi

# Load environment variables if .env exists
if [[ -f .env ]]; then
  source .env
fi

# Check required environment variables
if [[ -z "$STRIPE_SECRET_KEY" ]]; then
  echo "❌ STRIPE_SECRET_KEY not found in environment"
  exit 1
fi

if [[ -z "$STRIPE_WEBHOOK_SECRET" ]]; then
  echo "⚠️  STRIPE_WEBHOOK_SECRET not found in environment (this is expected if webhook isn't set up yet)"
else
  echo "✅ STRIPE_WEBHOOK_SECRET found"
fi

# Get Supabase function URL
if command -v supabase &> /dev/null; then
  FUNCTIONS_URL=$(supabase status 2>/dev/null | grep 'Edge Functions' | awk '{print $3}')
  if [[ -n "$FUNCTIONS_URL" ]]; then
    echo "✅ Supabase Edge Functions URL: $FUNCTIONS_URL"
    
    # Test webhook endpoint availability
    echo "🔍 Testing stripe-webhook endpoint..."
    webhook_status=$(curl -s -o /dev/null -w "%{http_code}" "$FUNCTIONS_URL/stripe-webhook")
    
    if [[ $webhook_status -eq 200 ]] || [[ $webhook_status -eq 405 ]]; then
      echo "✅ Stripe webhook endpoint is accessible"
    else
      echo "⚠️  Stripe webhook endpoint returned HTTP $webhook_status"
    fi
  else
    echo "⚠️  Could not determine Edge Functions URL"
  fi
else
  echo "⚠️  Supabase CLI not found, cannot determine function URLs"
fi

# Check Stripe API connectivity
echo "🔍 Testing Stripe API connectivity..."
stripe_test=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $STRIPE_SECRET_KEY" "https://api.stripe.com/v1/products?limit=1")

if [[ $stripe_test -eq 200 ]]; then
  echo "✅ Stripe API connection successful"
elif [[ $stripe_test -eq 401 ]]; then
  echo "❌ Stripe API authentication failed. Check your STRIPE_SECRET_KEY"
  exit 1
else
  echo "⚠️  Stripe API returned HTTP $stripe_test"
fi

echo ""
echo "📋 Webhook Setup Instructions:"
echo "1. Go to https://dashboard.stripe.com/webhooks"
echo "2. Click 'Add endpoint'"
echo "3. Enter URL: $FUNCTIONS_URL/stripe-webhook"
echo "4. Select events: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.payment_succeeded, invoice.payment_failed"
echo "5. Copy the webhook signing secret to your .env file as STRIPE_WEBHOOK_SECRET"
echo ""
echo "🎉 Webhook verification completed!"