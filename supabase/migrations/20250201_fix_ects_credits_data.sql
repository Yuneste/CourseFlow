-- Fix courses that have both credits and ECTS credits set
-- For users with ECTS academic system, keep only ECTS credits
-- For other users, keep only regular credits

-- First, update courses for ECTS users to keep only ECTS credits
UPDATE public.courses c
SET credits = NULL
WHERE c.user_id IN (
  SELECT id FROM public.profiles WHERE academic_system = 'ects'
) AND c.credits IS NOT NULL;

-- Then, update courses for non-ECTS users to keep only regular credits  
UPDATE public.courses c
SET ects_credits = NULL
WHERE c.user_id IN (
  SELECT id FROM public.profiles WHERE academic_system != 'ects' OR academic_system IS NULL
) AND c.ects_credits IS NOT NULL;

-- Also handle the special case where ECTS users have courses with only regular credits
-- Convert them to ECTS credits (using 1:1 ratio as we don't know the actual conversion)
UPDATE public.courses c
SET 
  ects_credits = c.credits,
  credits = NULL
WHERE c.user_id IN (
  SELECT id FROM public.profiles WHERE academic_system = 'ects'
) 
AND c.credits IS NOT NULL 
AND c.ects_credits IS NULL;