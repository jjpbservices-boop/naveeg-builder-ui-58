#!/bin/bash

# Smoke test script for Supabase functions
set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set"
    exit 1
fi

echo "🧪 Running smoke tests for Supabase functions..."

# Test ai-router ping
echo "Testing ai-router ping..."
AI_PING_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:4311" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  "$NEXT_PUBLIC_SUPABASE_URL/functions/v1/ai-router" \
  -d '{"action":"ping"}')

echo "ai-router ping response: $AI_PING_RESPONSE"

# Check if ping response contains success indicators
if echo "$AI_PING_RESPONSE" | grep -q '"ok":true'; then
    echo "✅ ai-router ping test passed"
else
    echo "❌ ai-router ping test failed"
    exit 1
fi

# Test ai-router create-website
echo "Testing ai-router create-website..."
AI_CREATE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:4311" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  "$NEXT_PUBLIC_SUPABASE_URL/functions/v1/ai-router" \
  -d '{"action":"create-website","brief":{"business_type":"service","business_name":"Smoke Test","business_description":"A test business for smoke testing"}}')

echo "ai-router create response: $AI_CREATE_RESPONSE"

# Check if create response contains success indicators
if echo "$AI_CREATE_RESPONSE" | grep -q '"ok":true'; then
    echo "✅ ai-router create-website test passed"
else
    echo "❌ ai-router create-website test failed"
    exit 1
fi

# Test psi-report ping
echo "Testing psi-report ping..."
PSI_PING_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  "$NEXT_PUBLIC_SUPABASE_URL/functions/v1/psi-report" \
  -d '{"url":"ping","strategy":"mobile"}')

echo "psi-report ping response: $PSI_PING_RESPONSE"

# Check if ping response contains performance score
if echo "$PSI_PING_RESPONSE" | grep -q '"performance_score"'; then
    echo "✅ psi-report ping test passed"
else
    echo "❌ psi-report ping test failed"
fi

# Test marketing app proxy
echo "Testing marketing app proxy..."
PROXY_RESPONSE=$(curl -s -i -X POST \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:4311" \
  "http://localhost:4311/api/start" \
  -d '{"business_name":"Test","business_type":"agency","business_description":"Test description"}')

echo "Proxy response: $PROXY_RESPONSE"

# Check if proxy returns 2xx or 4xx (not 5xx internal error)
if echo "$PROXY_RESPONSE" | grep -q "HTTP/1.1 [24]"; then
    echo "✅ Marketing proxy test passed (returns 2xx/4xx)"
else
    echo "❌ Marketing proxy test failed (returns 5xx internal error)"
    exit 1
fi

echo "🎉 Smoke tests completed!"
