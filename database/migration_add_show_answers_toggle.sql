-- Migration: Add show_answers toggle to sessions
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS show_answers BOOLEAN NOT NULL DEFAULT TRUE;
