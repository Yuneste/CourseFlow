-- Add onboarding_completed flag to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update existing users who have courses to have completed onboarding
UPDATE public.profiles p
SET onboarding_completed = TRUE
WHERE EXISTS (
  SELECT 1 FROM public.courses c 
  WHERE c.user_id = p.id
  LIMIT 1
);

-- Also mark users as onboarding completed if they have both study_program and degree_type
UPDATE public.profiles
SET onboarding_completed = TRUE
WHERE study_program IS NOT NULL 
  AND degree_type IS NOT NULL
  AND onboarding_completed = FALSE;