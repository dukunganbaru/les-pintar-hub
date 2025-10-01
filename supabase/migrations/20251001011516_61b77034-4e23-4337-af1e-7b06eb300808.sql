-- Fix security issue: Restrict profiles table access to authenticated users only
-- Drop the existing public policy that allows anyone to view profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new policy: Only authenticated users can view profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- This ensures that:
-- 1. Unauthenticated users cannot access sensitive personal information
-- 2. Authenticated users can still view profiles for platform interactions
-- 3. Public teacher information is available through the teachers table (which has its own policy)