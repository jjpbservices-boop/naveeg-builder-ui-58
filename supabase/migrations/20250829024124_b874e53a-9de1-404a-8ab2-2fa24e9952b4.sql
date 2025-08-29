-- Fix remaining critical security issues: Add missing RLS policies for action_logs only

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