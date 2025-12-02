-- Migration: Add user_id to sessions table
-- Run this SQL in your Supabase SQL Editor if you have an existing database

-- Step 1: Add user_id column (nullable first, then we'll make it required)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: For existing sessions, you'll need to either:
-- Option A: Delete existing sessions (uncomment the line below)
-- DELETE FROM sessions;

-- Option B: Assign existing sessions to a specific user (replace 'USER_UUID_HERE' with actual user ID)
-- UPDATE sessions SET user_id = 'USER_UUID_HERE' WHERE user_id IS NULL;

-- Step 3: Make user_id required (only after handling existing data)
-- ALTER TABLE sessions ALTER COLUMN user_id SET NOT NULL;

-- Step 4: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Step 5: Drop old policy and create new ones
DROP POLICY IF EXISTS "Allow all operations on sessions" ON sessions;
CREATE POLICY "Users can view their own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sessions" ON sessions
  FOR DELETE USING (auth.uid() = user_id);
