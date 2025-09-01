# Backend Implementation Guide

This document outlines the backend implementation for the 10Web and PSI integration project.

## Architecture Overview

The backend consists of two main Supabase Edge Functions:

1. **ai-router**: Handles website creation via 10Web API
2. **psi-collect**: Collects PageSpeed Insights data

## Local Development

### Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Docker running (for local Supabase)

### Setup

1. Start local Supabase:
```bash
supabase start
```

2. Set environment variables in `.env.local`:
```bash
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
TENWEB_API_KEY=your_tenweb_api_key
TENWEB_API_BASE=https://api.10web.io
FRONTEND_ORIGINS=http://localhost:4311,http://localhost:4312,https://*.naveeg.com,https://*.naveeg.app
PSI_API_KEY=your_google_pagespeed_api_key
```

3. Deploy functions locally:
```bash
supabase functions deploy ai-router --no-verify-jwt
supabase functions deploy psi-collect --no-verify-jwt
```

## API Testing

### Test ai-router

```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:4311" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  "http://localhost:54321/functions/v1/ai-router" \
  -d '{
    "action": "create-website",
    "brief": {
      "business_type": "service",
      "business_name": "Test Business",
      "business_description": "A test business for demo purposes",
      "preferred_subdomain": "test-biz"
    }
  }'
```

Expected Response:
```json
{
  "ok": true,
  "draft_id": "uuid-here",
  "region": "europe-west3-a",
  "subdomain": "test-biz",
  "website_id": "12345"
}
```

### Test psi-collect

```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  "http://localhost:54321/functions/v1/psi-collect" \
  -d '{
    "site_id": "00000000-0000-0000-0000-000000000000",
    "url": "https://example.com",
    "strategy": "mobile",
    "locale": "en",
    "categories": ["PERFORMANCE", "SEO"]
  }'
```

Expected Response:
```json
{
  "ok": true,
  "site_id": "00000000-0000-0000-0000-000000000000",
  "strategy": "mobile",
  "score": 0.85,
  "analysis_ts": "2025-09-02T12:00:00Z",
  "id": "result-uuid-here"
}
```

## Database Schema

### site_drafts
- `id`: UUID primary key
- `subdomain`: text (sanitized subdomain)
- `region`: text (10Web region)
- `brief`: jsonb (business details)
- `website_id`: text (10Web website ID)
- `status`: text ('created', 'queued', 'failed')
- `message`: text (error message if failed)
- `pages_meta`: jsonb (page metadata)
- `colors`: jsonb (color scheme)
- `fonts`: jsonb (font selection)
- `created_at`, `updated_at`: timestamps

### site_perf
- `id`: UUID primary key
- `site_id`: UUID (references site)
- `strategy`: text ('mobile' or 'desktop')
- `analysis_ts`: timestamptz (from PSI)
- `performance_score`: numeric (0-1)
- `crux`: jsonb (Chrome UX Report data)
- `lhr`: jsonb (Lighthouse result subset)
- `created_at`: timestamp

## Error Handling

### ai-router Errors
- `400`: Invalid payload or missing fields
- `403`: Origin not allowed
- `502`: 10Web API error (returned as TENWEB_ERROR)

### psi-collect Errors
- `400`: Invalid parameters
- `429`: PSI rate limit exceeded
- `502`: PSI API upstream error
- `500`: Internal server error

## Security

- **CORS**: Strict origin validation via `FRONTEND_ORIGINS`
- **RLS**: Row Level Security enabled on all tables
- **JWT**: Disabled for public functions (`verify_jwt = false`)
- **Service Role**: Database writes use service role key

## Monitoring

Functions log key events:
- Request origins and validation
- 10Web API calls and responses
- PSI API calls and throttling
- Database operations and errors
- Draft creation and status

Check function logs in Supabase Dashboard → Functions → Logs.

## Production Deployment

The GitHub Actions workflow automatically deploys:
1. Database migrations (`supabase db push`)
2. Function deployments (`supabase functions deploy`)

Required GitHub Secrets:
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_ID`

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check `FRONTEND_ORIGINS` includes your domain
2. **10Web API Failures**: Verify `TENWEB_API_KEY` and endpoint
3. **PSI Rate Limits**: Built-in throttling (1req/s) and retries
4. **Database Permission Errors**: Ensure service role key is set

### Debug Commands

```bash
# View function logs
supabase functions logs ai-router

# Check database status
supabase status

# Test local function
supabase functions serve --env-file .env.local
```