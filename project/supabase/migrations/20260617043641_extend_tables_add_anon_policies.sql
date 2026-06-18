/*
# Extend existing tables and add new tables for full backend

1. Changes to existing tables:
- `jobs`: Add location, priority, url, next_step, deadline, reason columns
- `contacts`: Add phone, tags, is_favorite, interaction_history columns
- `resumes`: Already has needed columns
- `interview_questions`: Add tip column

2. New Tables:
- `cover_letters`: Cover letter templates
- `job_scans`: Scanned job postings from URLs
- `research_notes`: Company research notes
- `user_stats`: Aggregate statistics

3. Security Changes:
- Switch ALL tables from authenticated-only to anon+authenticated policies
- Remove user_id foreign keys since this is a single-tenant demo without auth UI
- This allows the app to work without login

4. Important Notes
- Using ALTER TABLE ADD COLUMN IF NOT EXISTS pattern via DO blocks
- Dropping and recreating policies to switch to anon-accessible
- user_id columns kept but made nullable so anon can operate
*/

-- Add missing columns to jobs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'location') THEN
    ALTER TABLE jobs ADD COLUMN location text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'priority') THEN
    ALTER TABLE jobs ADD COLUMN priority text DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'url') THEN
    ALTER TABLE jobs ADD COLUMN url text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'next_step') THEN
    ALTER TABLE jobs ADD COLUMN next_step text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'deadline') THEN
    ALTER TABLE jobs ADD COLUMN deadline text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'reason') THEN
    ALTER TABLE jobs ADD COLUMN reason text DEFAULT '';
  END IF;
END $$;

-- Make jobs.user_id nullable so anon can insert
ALTER TABLE jobs ALTER COLUMN user_id DROP NOT NULL;

-- Add missing columns to contacts
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'phone') THEN
    ALTER TABLE contacts ADD COLUMN phone text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'tags') THEN
    ALTER TABLE contacts ADD COLUMN tags jsonb DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'is_favorite') THEN
    ALTER TABLE contacts ADD COLUMN is_favorite boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'interaction_history') THEN
    ALTER TABLE contacts ADD COLUMN interaction_history jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Make contacts.user_id nullable
ALTER TABLE contacts ALTER COLUMN user_id DROP NOT NULL;

-- Add tip column to interview_questions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interview_questions' AND column_name = 'tip') THEN
    ALTER TABLE interview_questions ADD COLUMN tip text DEFAULT '';
  END IF;
END $$;

-- Make interview_questions.user_id nullable
ALTER TABLE interview_questions ALTER COLUMN user_id DROP NOT NULL;

-- Make resumes.user_id nullable (already has DEFAULT auth.uid())
ALTER TABLE resumes ALTER COLUMN user_id DROP NOT NULL;

-- Make documents.user_id nullable
ALTER TABLE documents ALTER COLUMN user_id DROP NOT NULL;

-- Make job_activities.user_id nullable
ALTER TABLE job_activities ALTER COLUMN user_id DROP NOT NULL;

-- Switch policies to allow anon access (no auth UI, so anon must be able to operate)

-- Jobs policies
DROP POLICY IF EXISTS "anon_select_jobs" ON jobs;
CREATE POLICY "anon_select_jobs" ON jobs FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_jobs" ON jobs;
CREATE POLICY "anon_insert_jobs" ON jobs FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_jobs" ON jobs;
CREATE POLICY "anon_update_jobs" ON jobs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_jobs" ON jobs;
CREATE POLICY "anon_delete_jobs" ON jobs FOR DELETE TO anon, authenticated USING (true);

-- Contacts policies
DROP POLICY IF EXISTS "anon_select_contacts" ON contacts;
CREATE POLICY "anon_select_contacts" ON contacts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_contacts" ON contacts;
CREATE POLICY "anon_insert_contacts" ON contacts FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_contacts" ON contacts;
CREATE POLICY "anon_update_contacts" ON contacts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_contacts" ON contacts;
CREATE POLICY "anon_delete_contacts" ON contacts FOR DELETE TO anon, authenticated USING (true);

-- Resumes policies
DROP POLICY IF EXISTS "anon_select_resumes" ON resumes;
CREATE POLICY "anon_select_resumes" ON resumes FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_resumes" ON resumes;
CREATE POLICY "anon_insert_resumes" ON resumes FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_resumes" ON resumes;
CREATE POLICY "anon_update_resumes" ON resumes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_resumes" ON resumes;
CREATE POLICY "anon_delete_resumes" ON resumes FOR DELETE TO anon, authenticated USING (true);

-- Documents policies
DROP POLICY IF EXISTS "anon_select_documents" ON documents;
CREATE POLICY "anon_select_documents" ON documents FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_documents" ON documents;
CREATE POLICY "anon_insert_documents" ON documents FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_documents" ON documents;
CREATE POLICY "anon_update_documents" ON documents FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_documents" ON documents;
CREATE POLICY "anon_delete_documents" ON documents FOR DELETE TO anon, authenticated USING (true);

-- Interview questions policies
DROP POLICY IF EXISTS "anon_select_interview_questions" ON interview_questions;
CREATE POLICY "anon_select_interview_questions" ON interview_questions FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_interview_questions" ON interview_questions;
CREATE POLICY "anon_insert_interview_questions" ON interview_questions FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_interview_questions" ON interview_questions;
CREATE POLICY "anon_update_interview_questions" ON interview_questions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_interview_questions" ON interview_questions;
CREATE POLICY "anon_delete_interview_questions" ON interview_questions FOR DELETE TO anon, authenticated USING (true);

-- Job activities policies
DROP POLICY IF EXISTS "anon_select_job_activities" ON job_activities;
CREATE POLICY "anon_select_job_activities" ON job_activities FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_job_activities" ON job_activities;
CREATE POLICY "anon_insert_job_activities" ON job_activities FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_job_activities" ON job_activities;
CREATE POLICY "anon_update_job_activities" ON job_activities FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_job_activities" ON job_activities;
CREATE POLICY "anon_delete_job_activities" ON job_activities FOR DELETE TO anon, authenticated USING (true);

-- Profiles policies
DROP POLICY IF EXISTS "anon_select_profiles" ON profiles;
CREATE POLICY "anon_select_profiles" ON profiles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_profiles" ON profiles;
CREATE POLICY "anon_insert_profiles" ON profiles FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_profiles" ON profiles;
CREATE POLICY "anon_update_profiles" ON profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_profiles" ON profiles;
CREATE POLICY "anon_delete_profiles" ON profiles FOR DELETE TO anon, authenticated USING (true);

-- Create new tables

-- Cover Letters
CREATE TABLE IF NOT EXISTS cover_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  preview text DEFAULT '',
  full_text text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cover_letters" ON cover_letters;
CREATE POLICY "anon_select_cover_letters" ON cover_letters FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cover_letters" ON cover_letters;
CREATE POLICY "anon_insert_cover_letters" ON cover_letters FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cover_letters" ON cover_letters;
CREATE POLICY "anon_update_cover_letters" ON cover_letters FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cover_letters" ON cover_letters;
CREATE POLICY "anon_delete_cover_letters" ON cover_letters FOR DELETE TO anon, authenticated USING (true);

-- Job Scans
CREATE TABLE IF NOT EXISTS job_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text DEFAULT '',
  company text DEFAULT '',
  salary_min integer DEFAULT 0,
  salary_max integer DEFAULT 0,
  location text DEFAULT '',
  requirements jsonb DEFAULT '[]'::jsonb,
  original_url text DEFAULT '',
  posted text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE job_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_job_scans" ON job_scans;
CREATE POLICY "anon_select_job_scans" ON job_scans FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_job_scans" ON job_scans;
CREATE POLICY "anon_insert_job_scans" ON job_scans FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_job_scans" ON job_scans;
CREATE POLICY "anon_delete_job_scans" ON job_scans FOR DELETE TO anon, authenticated USING (true);

-- Research Notes
CREATE TABLE IF NOT EXISTS research_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text DEFAULT '',
  position text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE research_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_research_notes" ON research_notes;
CREATE POLICY "anon_select_research_notes" ON research_notes FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_research_notes" ON research_notes;
CREATE POLICY "anon_insert_research_notes" ON research_notes FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_research_notes" ON research_notes;
CREATE POLICY "anon_update_research_notes" ON research_notes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_research_notes" ON research_notes;
CREATE POLICY "anon_delete_research_notes" ON research_notes FOR DELETE TO anon, authenticated USING (true);

-- User Stats
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_key text NOT NULL,
  stat_value text DEFAULT '0',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_user_stats" ON user_stats;
CREATE POLICY "anon_select_user_stats" ON user_stats FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_user_stats" ON user_stats;
CREATE POLICY "anon_insert_user_stats" ON user_stats FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_user_stats" ON user_stats;
CREATE POLICY "anon_update_user_stats" ON user_stats FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_user_stats" ON user_stats;
CREATE POLICY "anon_delete_user_stats" ON user_stats FOR DELETE TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
CREATE INDEX IF NOT EXISTS idx_contacts_is_favorite ON contacts(is_favorite);
CREATE INDEX IF NOT EXISTS idx_interview_questions_category ON interview_questions(category);
CREATE INDEX IF NOT EXISTS idx_interview_questions_practiced ON interview_questions(practiced);
