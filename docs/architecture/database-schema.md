# Database Schema

## SQL Schema Definition
```sql
-- Users table managed by Supabase Auth
-- Additional user profile data with localization
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  university TEXT,
  avatar_url TEXT,
  preferred_locale TEXT DEFAULT 'en-US',
  country TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  academic_system TEXT CHECK (academic_system IN ('gpa', 'ects', 'uk_honours', 'percentage')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table with regional academic support
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  professor TEXT,
  term TEXT NOT NULL,
  academic_period_type TEXT CHECK (academic_period_type IN ('semester', 'term', 'trimester')),
  credits INTEGER, -- US/Canada credits
  ects_credits INTEGER, -- European ECTS
  color TEXT NOT NULL DEFAULT '#3B82F6',
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Files table with multilingual support
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  original_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  detected_language TEXT,
  ai_category TEXT CHECK (ai_category IN ('lecture', 'assignment', 'notes', 'exam', 'other')),
  ai_summary TEXT,
  ai_summary_translations JSONB DEFAULT '{}',
  ai_confidence FLOAT CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Study sessions table
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  duration INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Flashcards table with language support
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  times_studied INTEGER DEFAULT 0,
  confidence_score FLOAT DEFAULT 0.5,
  next_review_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups table with language preferences
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  max_members INTEGER DEFAULT 20,
  primary_language TEXT NOT NULL DEFAULT 'en',
  allowed_languages TEXT[] DEFAULT ARRAY['en'],
  settings JSONB DEFAULT '{"allow_file_sharing": true, "allow_chat": true, "require_approval": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group members table
CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Shared files table
CREATE TABLE shared_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table with multi-currency
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'student', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('trialing', 'active', 'canceled', 'past_due')),
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'CAD', 'EUR', 'GBP')),
  country_code TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature, period_start)
);

-- Grades table for tracking different grading systems
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  grade_value TEXT NOT NULL,
  grade_type TEXT CHECK (grade_type IN ('letter', 'percentage', 'gpa_points', 'ects_grade')),
  academic_period TEXT NOT NULL,
  date_recorded TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academic terms reference table
CREATE TABLE academic_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  institution_type TEXT,
  term_name TEXT NOT NULL,
  start_month INTEGER NOT NULL,
  end_month INTEGER NOT NULL,
  is_primary_term BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Translations table for dynamic content
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  locale TEXT NOT NULL,
  value TEXT NOT NULL,
  context TEXT CHECK (context IN ('ui', 'academic', 'email')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key, locale, context)
);

-- Indexes for performance
CREATE INDEX idx_files_user_course ON files(user_id, course_id);
CREATE INDEX idx_files_created ON files(created_at DESC);
CREATE INDEX idx_study_sessions_user ON study_sessions(user_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);

-- Row Level Security Policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own courses
CREATE POLICY "Users can view own courses" ON courses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own courses" ON courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own courses" ON courses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own courses" ON courses
  FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for files and study_sessions...
```
