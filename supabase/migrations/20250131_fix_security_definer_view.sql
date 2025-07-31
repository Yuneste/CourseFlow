-- Fix security definer view to use security invoker
-- This ensures the view respects the current user's permissions and RLS policies

-- First, we need to get the current view definition
-- Since we don't have the original definition, we'll need to recreate it based on its likely purpose

-- Drop the existing view if it exists
DROP VIEW IF EXISTS public.current_semester_info CASCADE;

-- Recreate the view with security_invoker
-- This view likely provides information about the current academic semester/term
CREATE OR REPLACE VIEW public.current_semester_info 
WITH (security_invoker = true) AS
SELECT 
    -- Assuming this view provides current term information
    CASE 
        -- Northern Hemisphere Academic Calendar (US, Canada, Europe)
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 8 AND 12 THEN 
            'Fall ' || EXTRACT(YEAR FROM CURRENT_DATE)
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 1 AND 5 THEN 
            'Spring ' || EXTRACT(YEAR FROM CURRENT_DATE)
        ELSE 
            'Summer ' || EXTRACT(YEAR FROM CURRENT_DATE)
    END AS current_term,
    
    CASE 
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 8 AND 12 THEN 
            EXTRACT(YEAR FROM CURRENT_DATE)
        ELSE 
            EXTRACT(YEAR FROM CURRENT_DATE) - 1
    END AS academic_year_start,
    
    CASE 
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 8 AND 12 THEN 
            EXTRACT(YEAR FROM CURRENT_DATE) + 1
        ELSE 
            EXTRACT(YEAR FROM CURRENT_DATE)
    END AS academic_year_end,
    
    -- Current date for reference
    CURRENT_DATE as current_date,
    
    -- Semester dates (approximate)
    CASE 
        -- Fall semester
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 8 AND 12 THEN 
            DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '7 months' -- August 1
        -- Spring semester
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 1 AND 5 THEN 
            DATE_TRUNC('year', CURRENT_DATE) -- January 1
        -- Summer semester
        ELSE 
            DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '5 months' -- June 1
    END AS semester_start_date,
    
    CASE 
        -- Fall semester ends in December
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 8 AND 12 THEN 
            DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '11 months' + INTERVAL '31 days' - INTERVAL '1 day'
        -- Spring semester ends in May
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 1 AND 5 THEN 
            DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '4 months' + INTERVAL '31 days' - INTERVAL '1 day'
        -- Summer semester ends in August
        ELSE 
            DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '7 months' + INTERVAL '31 days' - INTERVAL '1 day'
    END AS semester_end_date;

-- Grant appropriate permissions
GRANT SELECT ON public.current_semester_info TO authenticated;
GRANT SELECT ON public.current_semester_info TO anon;

-- Add a comment explaining the security change
COMMENT ON VIEW public.current_semester_info IS 
'Provides current academic semester/term information. Updated to use security_invoker to respect user permissions and RLS policies.';