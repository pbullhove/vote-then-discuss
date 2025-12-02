-- Migration: Change session ID from UUID to 4-character string and add name column
-- Run this SQL in your Supabase SQL Editor if you have an existing database
-- WARNING: This migration will delete all existing data. Backup first if needed!

-- Step 1: Drop foreign key constraints that reference sessions.id
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_session_id_fkey;
ALTER TABLE answers DROP CONSTRAINT IF EXISTS answers_session_id_fkey;
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_session_id_fkey;

-- Step 2: Delete all existing data (since we're changing the primary key type)
DELETE FROM submissions;
DELETE FROM answers;
DELETE FROM questions;
DELETE FROM sessions;

-- Step 3: Create function to generate 4-character session IDs
CREATE OR REPLACE FUNCTION generate_session_id() RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..4 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Change column types in dependent tables FIRST (before recreating sessions table)
-- Since we've deleted all data, we can safely change the types
ALTER TABLE questions ALTER COLUMN session_id TYPE VARCHAR(4);
ALTER TABLE answers ALTER COLUMN session_id TYPE VARCHAR(4);
ALTER TABLE submissions ALTER COLUMN session_id TYPE VARCHAR(4);

-- Step 5: Drop the old sessions table and recreate with new schema
DROP TABLE IF EXISTS sessions CASCADE;

CREATE TABLE sessions (
  id VARCHAR(4) PRIMARY KEY DEFAULT generate_session_id(),
  name TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Step 6: Recreate foreign key constraints (now that all column types match)
ALTER TABLE questions ADD CONSTRAINT questions_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;
ALTER TABLE answers ADD CONSTRAINT answers_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;
ALTER TABLE submissions ADD CONSTRAINT submissions_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

-- Step 7: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_session_id ON questions(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_session_id ON answers(session_id);
CREATE INDEX IF NOT EXISTS idx_submissions_session_id ON submissions(session_id);

-- Step 8: Re-enable RLS and recreate policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON sessions;

CREATE POLICY "Users can view their own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sessions" ON sessions
  FOR DELETE USING (auth.uid() = user_id);
