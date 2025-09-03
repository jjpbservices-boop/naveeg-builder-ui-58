# 🚀 **LOVABLE DEPLOYMENT INSTRUCTIONS**

## 🎯 **GOAL: Deploy Updated Supabase Backend & Get Onboarding Flow Working**

The `marketing/refactor` branch has been successfully merged to main. Now we need to deploy the updated Supabase backend to get the onboarding flow working end-to-end.

---

## 📋 **CRITICAL TASKS TO COMPLETE**

### **1. 🗄️ DEPLOY UPDATED AI-ROUTER EDGE FUNCTION**

**Location**: `supabase/functions/ai-router/index.ts`

**What to do**:
1. Go to **Supabase Dashboard** → **Functions** → **ai-router**
2. Replace the entire function code with the content from `supabase/functions/ai-router/index.ts`
3. **Deploy the function**

**Key changes in the new function**:
- ✅ **Public access** (no JWT required for onboarding)
- ✅ **Origin validation** with CORS support
- ✅ **Frankfurt region enforcement** (europe-west3-a, europe-west3-b, europe-west3-c)
- ✅ **Better error handling** and validation
- ✅ **Updated schema** matching the new `site_drafts` table

---

### **2. 🔧 SET EDGE FUNCTION ENVIRONMENT VARIABLES**

**Go to**: Supabase Dashboard → Functions → ai-router → Settings → Environment Variables

**Set these variables**:
```bash
SUPABASE_URL=https://eilpazegjrcrwgpujqni.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your_service_role_key]
TENWEB_API_KEY=[your_10web_api_key]
TENWEB_API_BASE=https://api.10web.io
FRONTEND_ORIGINS=http://localhost:4311,http://localhost:4312,https://*.naveeg.com,https://*.naveeg.app
```

**Critical**: The `FRONTEND_ORIGINS` must include `http://localhost:4311` for local development!

---

### **3. 🗃️ APPLY DATABASE MIGRATIONS**

**Apply these migrations in order**:

#### **Migration 1: Public Draft Insert Policy**
```sql
-- File: supabase/migrations/2025_01_public_draft_insert.sql
ALTER TABLE public.site_drafts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='site_drafts' AND policyname='public_draft_insert'
  ) THEN
    CREATE POLICY public_draft_insert ON public.site_drafts
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;
```

#### **Migration 2: Cleanup Schema (if needed)**
```sql
-- File: supabase/migrations/2025_01_cleanup_schema.sql
-- Apply this if the schema needs to be cleaned up
-- (Check if site_drafts table exists and has correct structure)
```

#### **Migration 3: Add TenWeb Fields (if needed)**
```sql
-- File: supabase/migrations/2025_01_add_tenweb_fields.sql
-- Apply this if TenWeb fields are missing from site_drafts
```

---

### **4. 🧪 TEST THE COMPLETE FLOW**

**After deployment, test this flow**:

1. **Start the apps**:
   ```bash
   pnpm --filter marketing dev  # Should run on localhost:4311
   pnpm --filter dashboard dev  # Should run on localhost:4312
   ```

2. **Test the onboarding form**:
   - Go to `http://localhost:4311/start`
   - Fill out the form with:
     - Business Type: `service` (or any of: restaurant, retail, service, ecommerce)
     - Business Name: `Test Business`
     - Business Description: `A test business description`
     - Preferred Subdomain: `test-business`
   - Click "Start Building"

3. **Expected behavior**:
   - ✅ Form submits successfully
   - ✅ Redirects to `/design?draft_id=...`
   - ✅ No 401/422 errors in console
   - ✅ Draft is created in `site_drafts` table

---

## 🔍 **TROUBLESHOOTING GUIDE**

### **If you get 401 Unauthorized**:
- ✅ Check that `FRONTEND_ORIGINS` includes `http://localhost:4311`
- ✅ Verify the Edge Function is deployed with the new code
- ✅ Check that `verify_jwt = false` in `supabase/config.toml`

### **If you get 422 Unprocessable Entity**:
- ✅ Check that business_type is one of: `restaurant`, `retail`, `service`, `ecommerce`
- ✅ Verify all required fields are filled
- ✅ Check the Edge Function logs for validation errors

### **If you get 500 Internal Server Error**:
- ✅ Check Edge Function logs in Supabase Dashboard
- ✅ Verify all environment variables are set correctly
- ✅ Check that the `site_drafts` table exists and has correct structure

### **If the form doesn't redirect**:
- ✅ Check browser console for JavaScript errors
- ✅ Verify the API route `/api/start` is working
- ✅ Check that the response contains `draft_id`

---

## 📊 **VERIFICATION CHECKLIST**

**Before marking as complete, verify**:

- [ ] ✅ Edge Function deployed with new code
- [ ] ✅ All environment variables set correctly
- [ ] ✅ RLS policy allows public draft inserts
- [ ] ✅ Marketing app starts on localhost:4311
- [ ] ✅ Dashboard app starts on localhost:4312
- [ ] ✅ Onboarding form submits without errors
- [ ] ✅ Form redirects to `/design` page
- [ ] ✅ Draft appears in `site_drafts` table
- [ ] ✅ No console errors in browser
- [ ] ✅ No errors in Edge Function logs

---

## 🎯 **SUCCESS CRITERIA**

**The deployment is successful when**:

1. **✅ Form Submission Works**: User can fill out the onboarding form and submit it
2. **✅ No Authentication Errors**: No 401/422 errors from the Edge Function
3. **✅ Successful Redirect**: Form redirects to `/design?draft_id=...`
4. **✅ Database Integration**: Draft is saved to `site_drafts` table
5. **✅ Clean Logs**: No errors in browser console or Edge Function logs

---

## 📞 **SUPPORT**

**If you encounter issues**:

1. **Check Edge Function logs** in Supabase Dashboard
2. **Verify environment variables** are set correctly
3. **Test the Edge Function directly** with curl:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     -H "Origin: http://localhost:4311" \
     https://eilpazegjrcrwgpujqni.supabase.co/functions/v1/ai-router \
     -d '{"action":"create-website","brief":{"business_type":"service","business_name":"Test","business_description":"Test description"}}'
   ```

**Expected response**: `{"ok": true, "draft_id": "...", "website_id": "...", "region": "europe-west3-a"}`

---

## 🚀 **READY TO DEPLOY!**

The code is ready, the instructions are clear, and the goal is achievable. Once you complete these tasks, the onboarding flow will work end-to-end and users will be able to create websites through the marketing site.

**Priority**: This is **HIGH PRIORITY** - the entire onboarding flow depends on this deployment working correctly.

**Time Estimate**: 30-45 minutes for a complete deployment and testing.

---

**Good luck! 🎉**
