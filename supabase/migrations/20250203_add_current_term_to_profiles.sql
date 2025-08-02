-- Add current_term column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS current_term text;

-- Add comment explaining the column
COMMENT ON COLUMN profiles.current_term IS 'User selected current academic term, overrides system calculated term';