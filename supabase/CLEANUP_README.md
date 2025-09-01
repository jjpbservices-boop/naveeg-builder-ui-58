# 🧹 Supabase Cleanup Guide

## 🚨 **IMPORTANT: Backup First!**
Before running any cleanup, make sure to:
1. **Export your current database** from Supabase dashboard
2. **Test the cleanup migration** in a staging environment first
3. **Have a rollback plan** ready

## 📋 **Current Issues Found**

### 1. **Duplicate Migrations**
- Multiple migrations with similar content
- Conflicting table structures
- Orphaned tables and functions

### 2. **Schema Inconsistencies**
- `profiles` table has different structures in different migrations
- `sites` table missing `tenweb_website_id` field in some versions
- `subscriptions` table has conflicting schemas

### 3. **Missing Dependencies**
- Some migrations reference functions that don't exist
- RLS policies that are too permissive
- Missing indexes for performance

## 🔧 **Cleanup Steps**

### **Step 1: Run the Cleanup Migration**
```sql
-- Apply the cleanup migration
-- This will drop and recreate all tables with clean schemas
```

### **Step 2: Remove Old Migration Files**
After confirming the cleanup migration works, delete these old migration files:
- `20250829001820_*.sql` (duplicate plans table)
- `20250829001840_*.sql` (duplicate plans table)
- Any other migrations that create conflicting tables

### **Step 3: Update Seed Data**
The seed.sql file references tables that no longer exist. Update it to match the new schema.

## 📊 **New Clean Schema**

### **Core Tables**
1. **`profiles`** - User profiles with proper RLS
2. **`plans`** - Subscription plans (public read)
3. **`sites`** - User websites with 10Web integration
4. **`site_drafts`** - Onboarding drafts (public access)
5. **`subscriptions`** - User subscriptions
6. **`analytics_snapshots`** - Performance metrics
7. **`stripe_prices`** - Stripe price mappings

### **Key Improvements**
- ✅ **Consistent naming** - All tables use `user_id` instead of `owner`
- ✅ **Proper RLS** - Users can only access their own data
- ✅ **Public onboarding** - `site_drafts` allows public access
- ✅ **Performance indexes** - Proper indexing for all queries
- ✅ **Clean relationships** - Proper foreign key constraints

## 🚀 **Deployment Steps**

### **1. In Supabase Dashboard**
1. Go to **SQL Editor**
2. Copy and paste the cleanup migration
3. Run the migration
4. Verify all tables are created correctly

### **2. Test the Setup**
1. Try the onboarding flow
2. Verify RLS policies work
3. Check that existing data (if any) is preserved

### **3. Update Your Apps**
1. Update any hardcoded table references
2. Test authentication flows
3. Verify subscription handling

## 🔍 **Verification Commands**

After running the cleanup, verify with these SQL commands:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## ⚠️ **Potential Issues**

### **Data Loss Risk**
- The cleanup migration **drops and recreates** all tables
- **No existing data will be preserved**
- This is intentional for a clean slate

### **Function Dependencies**
- Some Edge Functions might reference old table names
- Update function code to match new schema
- Test all functions after cleanup

### **RLS Policy Changes**
- Old policies are replaced with stricter ones
- Users can only access their own data
- Public access only for onboarding (`site_drafts`)

## 🎯 **Expected Results**

After cleanup:
- ✅ **Clean, consistent schema**
- ✅ **Proper RLS policies**
- ✅ **Performance indexes**
- ✅ **Working onboarding flow**
- ✅ **Secure user data access**
- ✅ **No duplicate tables or migrations**

## 📞 **Need Help?**

If something goes wrong:
1. **Restore from backup**
2. **Check Supabase logs**
3. **Verify migration syntax**
4. **Test in staging first**

---

**Remember: This is a destructive operation that will recreate your entire database schema. Make sure you have backups and test thoroughly before running in production.**
