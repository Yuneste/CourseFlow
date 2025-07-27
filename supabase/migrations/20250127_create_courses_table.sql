-- Create courses table for storing user courses
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  code TEXT CHECK (code IS NULL OR char_length(code) <= 20),
  professor TEXT CHECK (professor IS NULL OR char_length(professor) <= 100),
  term TEXT NOT NULL,
  academic_period_type TEXT CHECK (academic_period_type IN ('semester', 'term', 'trimester')),
  credits INTEGER CHECK (credits IS NULL OR credits BETWEEN 0 AND 10),
  ects_credits INTEGER CHECK (ects_credits IS NULL OR ects_credits BETWEEN 0 AND 30),
  color TEXT NOT NULL DEFAULT '#3B82F6',
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster user queries
CREATE INDEX idx_courses_user_id ON public.courses(user_id);

-- Create index for term filtering
CREATE INDEX idx_courses_user_term ON public.courses(user_id, term);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own courses
CREATE POLICY "Users can view own courses" ON public.courses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only insert courses for themselves
CREATE POLICY "Users can insert own courses" ON public.courses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own courses
CREATE POLICY "Users can update own courses" ON public.courses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own courses
CREATE POLICY "Users can delete own courses" ON public.courses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add constraint to prevent duplicate course names within the same term for a user
ALTER TABLE public.courses
  ADD CONSTRAINT unique_user_course_term UNIQUE (user_id, name, term);