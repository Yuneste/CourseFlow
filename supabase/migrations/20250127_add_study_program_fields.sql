-- Add study program fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS study_program TEXT,
ADD COLUMN IF NOT EXISTS degree_type TEXT CHECK (degree_type IN ('bachelor', 'master', 'phd', 'diploma', 'associate', 'undergraduate', 'graduate', 'postgraduate', 'other')),
ADD COLUMN IF NOT EXISTS start_year INTEGER CHECK (start_year >= 1900 AND start_year <= 2100),
ADD COLUMN IF NOT EXISTS expected_graduation_year INTEGER CHECK (expected_graduation_year >= 1900 AND expected_graduation_year <= 2100);

-- Add constraint to ensure expected graduation year is after start year
ALTER TABLE public.profiles
ADD CONSTRAINT graduation_after_start CHECK (expected_graduation_year IS NULL OR start_year IS NULL OR expected_graduation_year >= start_year);