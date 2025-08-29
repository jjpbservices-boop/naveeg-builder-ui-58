-- Fix Critical Security Issues: Add missing RLS policies

-- 1. Fix Profiles Table Security - Add missing INSERT, UPDATE, DELETE policies
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- 2. Fix Action Logs Security - Add missing INSERT, UPDATE, DELETE policies
CREATE POLICY "System can insert action logs" 
ON public.action_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cannot update action logs" 
ON public.action_logs 
FOR UPDATE 
USING (false);

CREATE POLICY "Users cannot delete action logs" 
ON public.action_logs 
FOR DELETE 
USING (false);