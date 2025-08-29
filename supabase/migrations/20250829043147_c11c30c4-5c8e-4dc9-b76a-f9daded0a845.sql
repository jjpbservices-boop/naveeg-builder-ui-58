-- Fix security vulnerability in subscriptions table RLS policies
-- The current "Service role can manage all subscriptions" policy is too permissive
-- and allows all authenticated users to view all subscription data

-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.subscriptions;

-- Create separate, more specific policies for service role operations
-- These policies use auth.role() to ensure they only apply to service role requests

-- Allow service role to INSERT subscriptions (for webhook/automated creation)
CREATE POLICY "Service role can insert subscriptions" 
ON public.subscriptions 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Allow service role to UPDATE subscriptions (for webhook/automated updates)
CREATE POLICY "Service role can update subscriptions" 
ON public.subscriptions 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

-- Allow service role to DELETE subscriptions (for cleanup/cancellations)
CREATE POLICY "Service role can delete subscriptions" 
ON public.subscriptions 
FOR DELETE 
TO service_role
USING (true);

-- Allow service role to SELECT all subscriptions (for admin operations)
CREATE POLICY "Service role can select all subscriptions" 
ON public.subscriptions 
FOR SELECT 
TO service_role
USING (true);

-- The existing "Users can view their own subscriptions" policy remains unchanged
-- This ensures regular users can only see their own subscription data