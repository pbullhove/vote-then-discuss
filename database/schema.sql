-- Vote Then Discuss Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Function to generate a random 4-character session ID
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

-- Sessions table: Stores voting sessions
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(4) PRIMARY KEY DEFAULT generate_session_id(),
  name TEXT,
  show_answers BOOLEAN NOT NULL DEFAULT TRUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Questions table: Stores questions for each session
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(4) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(session_id, question_order)
);

-- Answers table: Stores user answers to questions
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  session_id VARCHAR(4) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  user_id TEXT NOT NULL, -- Simple identifier for users (can be generated client-side)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(question_id, user_id) -- One answer per user per question
);

-- Submissions table: Tracks when a user submits all their answers
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(4) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(session_id, user_id) -- One submission per user per session
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_session_id ON questions(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_session_id ON answers(session_id);
CREATE INDEX IF NOT EXISTS idx_submissions_session_id ON submissions(session_id);

-- Enable Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Sessions are publicly readable, but only owners can modify
DROP POLICY IF EXISTS "Allow all operations on sessions" ON sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Anyone can view sessions" ON sessions;
-- Allow anyone to read sessions (needed for anonymous participation)
CREATE POLICY "Anyone can view sessions" ON sessions
  FOR SELECT USING (true);
CREATE POLICY "Users can create their own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sessions" ON sessions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Allow all operations on questions" ON questions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on answers" ON answers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on submissions" ON submissions
  FOR ALL USING (true) WITH CHECK (true);

