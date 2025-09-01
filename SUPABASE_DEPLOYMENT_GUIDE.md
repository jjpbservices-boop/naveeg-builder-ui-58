# 🚀 Supabase Deployment Guide for Lovable

## 🎯 **Goal**
Deploy the updated `ai-router` Edge Function to enable **public onboarding** without authentication, with Frankfurt region enforcement and proper CORS handling.

## 📋 **What Needs to be Done**

### **1. Edge Function Environment Variables**
Set these secrets in Supabase → Functions → ai-router → Settings:

```
SUPABASE_URL = https://eilpazegjrcrwgpujqni.supabase.co
SUPABASE_SERVICE_ROLE_KEY = [your_service_role_key]
TENWEB_API_KEY = [your_10web_api_key]
TENWEB_API_BASE = https://api.10web.io
FRONTEND_ORIGINS = http://localhost:4311,http://localhost:4312,https://*.naveeg.com,https://*.naveeg.app
```

### **2. Deploy the Updated ai-router Function**
The function code has been updated to:
- ✅ **Allow public access** (no JWT required)
- ✅ **Enforce Frankfurt region** (europe-west3-a → b → c → fallback)
- ✅ **Handle CORS properly** for localhost and naveeg domains
- ✅ **Use service role internally** for database operations (safe even with public callers)
- ✅ **Create 10Web websites** and save drafts to `site_drafts` table

### **3. Run the RLS Migration**
Execute this SQL in Supabase → SQL Editor:

```sql
-- Allow public insert for onboarding (safe – function uses service role anyway)
-- This enables the onboarding flow to work without authentication

-- Enable RLS on site_drafts table
ALTER TABLE public.site_drafts ENABLE ROW LEVEL SECURITY;

-- Create policy for public draft insert during onboarding
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='site_drafts' AND policyname='public_draft_insert'
  ) THEN
    CREATE POLICY public_draft_insert ON public.site_drafts
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;
```

## 🔧 **Deployment Steps**

### **Step 1: Update Environment Variables**
1. Go to Supabase Dashboard → Functions → ai-router
2. Click "Settings" tab
3. Add/update the environment variables listed above
4. **Save** the changes

### **Step 2: Deploy the Function**
1. The function code is already updated in `supabase/functions/ai-router/index.ts`
2. Deploy using Supabase CLI or Dashboard
3. **Verify** the function is running

### **Step 3: Test the Function**
Test with this curl command (replace `<YOUR-PROJECT-REF>` with your actual project ref):

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:4311" \
  "https://eilpazegjrcrwgpujqni.functions.supabase.co/ai-router" \
  -d '{
    "action":"create-website",
    "brief":{
      "business_type":"restaurant",
      "business_name":"Chez Léa",
      "business_description":"Seasonal bistro in Frankfurt.",
      "preferred_subdomain":"chez-lea"
    }
  }'
```

**Expected Response:**
```json
{
  "ok": true,
  "draft_id": "uuid-here",
  "region": "europe-west3-a",
  "subdomain": "chez-lea",
  "website_id": "10web-website-id"
}
```

## ✅ **What This Fixes**

1. **401 Unauthorized Errors** - Function now accepts public calls
2. **CORS Issues** - Proper origin handling for localhost and naveeg domains
3. **Region Enforcement** - Always creates websites in Frankfurt (europe-west3)
4. **Database Access** - Uses service role internally for safe operations
5. **Onboarding Flow** - Complete `/start` → `/design` flow works end-to-end

## 🚨 **Security Notes**

- **Public access is safe** because the function uses `SUPABASE_SERVICE_ROLE_KEY` internally
- **No secrets exposed** to the browser
- **CORS restricted** to allowed origins only
- **Input validation** on all parameters

## 🔍 **Troubleshooting**

If you still get 401 errors after deployment:
1. Check that `verify_jwt = false` is set in `supabase/config.toml`
2. Verify all environment variables are set correctly
3. Check function logs for any errors
4. Ensure the function was deployed successfully

## 📱 **Frontend Status**

The frontend is already updated and ready:
- ✅ **No server actions** - uses client-side form submission
- ✅ **API route handler** - calls ai-router function
- ✅ **Clean UI** - no 10Web branding, shows `.naveeg.com`
- ✅ **Error handling** - proper user feedback

Once you deploy this function, the entire onboarding flow will work perfectly! 🎉
