-- Migration: Allow public read access to sessions
-- This allows unauthenticated users to view sessions (needed for anonymous participation)

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;

-- Create a new policy that allows anyone to read sessions
CREATE POLICY "Anyone can view sessions" ON sessions
  FOR SELECT USING (true);

-- Keep the other policies for authenticated users only
-- (INSERT, UPDATE, DELETE still require authentication and ownership)
