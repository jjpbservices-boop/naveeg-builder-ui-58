# Supabase Environment Variables Setup

## Required Environment Variables

### For ai-router function:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
TENWEB_API_BASE=https://api.10web.io
TENWEB_API_KEY=your_tenweb_api_key
FRONTEND_ORIGINS=http://localhost:4311,http://localhost:4312,https://*.naveeg.com,https://*.naveeg.app
```

### For psi-report function:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PSI_API_KEY=your_pagespeed_insights_api_key
```

### For frontend applications:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Setup Instructions

### 1. Supabase Dashboard Setup
1. Go to your Supabase project dashboard
2. Navigate to Settings > Edge Functions
3. For each function (ai-router, psi-report), set the environment variables listed above
4. Ensure all variables are set before deploying functions

### 2. GitHub Secrets Setup
For CI/CD to work, set these repository secrets in GitHub:
- `SUPABASE_ACCESS_TOKEN` - Your Supabase access token
- `SUPABASE_PROJECT_REF` - Your project reference ID
- `SUPABASE_DB_PASSWORD` - Your database password
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

### 3. Local Development Setup
Create `.env.local` files in your app directories with the frontend variables.

## Manual Deployment Commands

```bash
# Deploy migrations
supabase db push

# Deploy functions
supabase functions deploy ai-router
supabase functions deploy psi-report
```

## Verification

Run smoke tests to verify everything is working:
```bash
pnpm run smoke
```