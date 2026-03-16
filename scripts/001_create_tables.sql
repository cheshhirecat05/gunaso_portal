-- Gunaso Portal Database Schema
-- Step 1: Create departments table first

CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial departments
INSERT INTO public.departments (name, description) VALUES
  ('Healthcare', 'Health related complaints and services'),
  ('Education', 'Education sector complaints'),
  ('Infrastructure', 'Roads, bridges, public facilities'),
  ('Environment', 'Environmental issues and sanitation'),
  ('Administration', 'General administrative matters')
ON CONFLICT (name) DO NOTHING;
