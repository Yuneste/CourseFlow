-- Complete Security Fixes for CourseFlow
-- This migration applies all security fixes in one go

-- 1. Fix Security Definer View
DROP VIEW IF EXISTS public.current_semester_info CASCADE;

CREATE OR REPLACE VIEW public.current_semester_info 
WITH (security_invoker = true) AS
SELECT 
    CASE 
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
    
    CURRENT_DATE as current_date,
    
    CASE 
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 8 AND 12 THEN 
            DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '7 months'
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 1 AND 5 THEN 
            DATE_TRUNC('year', CURRENT_DATE)
        ELSE 
            DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '5 months'
    END AS semester_start_date,
    
    CASE 
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 8 AND 12 THEN 
            DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '11 months' + INTERVAL '31 days' - INTERVAL '1 day'
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 1 AND 5 THEN 
            DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '4 months' + INTERVAL '31 days' - INTERVAL '1 day'
        ELSE 
            DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '7 months' + INTERVAL '31 days' - INTERVAL '1 day'
    END AS semester_end_date;

GRANT SELECT ON public.current_semester_info TO authenticated;
GRANT SELECT ON public.current_semester_info TO anon;

COMMENT ON VIEW public.current_semester_info IS 
'Provides current academic semester/term information. Updated to use security_invoker to respect user permissions and RLS policies.';

-- 2. Fix Function Search Paths (only for functions that exist)
DO $$
DECLARE
    func_record RECORD;
    update_count INTEGER := 0;
BEGIN
    -- Create a temporary table to track functions we need to update
    CREATE TEMP TABLE functions_to_update (
        func_name TEXT,
        func_args TEXT
    );

    -- Add known functions that might exist
    INSERT INTO functions_to_update (func_name, func_args) VALUES
        ('handle_new_user', ''),
        ('handle_updated_at', ''),
        ('delete_user_account', ''),
        ('delete_user', ''),
        ('update_updated_at', ''),
        ('update_updated_at_column', ''),
        ('ensure_single_current_term', ''),
        ('auto_confirm_email', ''),
        ('handle_oauth_user_profile', ''),
        ('on_course_created', ''),
        ('create_default_course_folders', 'course_id UUID');

    -- Update each function if it exists
    FOR func_record IN SELECT * FROM functions_to_update LOOP
        IF EXISTS (
            SELECT 1 FROM pg_proc p 
            JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' 
            AND p.proname = func_record.func_name
        ) THEN
            BEGIN
                IF func_record.func_args = '' THEN
                    EXECUTE format('ALTER FUNCTION public.%I() SET search_path = public, pg_temp', func_record.func_name);
                ELSE
                    EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = public, pg_temp', func_record.func_name, func_record.func_args);
                END IF;
                update_count := update_count + 1;
                RAISE NOTICE 'Updated function: %', func_record.func_name;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Could not update function % (may have different arguments): %', func_record.func_name, SQLERRM;
            END;
        END IF;
    END LOOP;

    -- Handle functions with variable arguments
    -- resend_confirmation_email
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'resend_confirmation_email' AND pronamespace = 'public'::regnamespace) THEN
        BEGIN
            EXECUTE format('ALTER FUNCTION public.resend_confirmation_email(%s) SET search_path = public, pg_temp',
                (SELECT pg_get_function_identity_arguments(oid) FROM pg_proc 
                 WHERE proname = 'resend_confirmation_email' AND pronamespace = 'public'::regnamespace LIMIT 1));
            update_count := update_count + 1;
            RAISE NOTICE 'Updated function: resend_confirmation_email';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not update resend_confirmation_email: %', SQLERRM;
        END;
    END IF;

    -- custom_login
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'custom_login' AND pronamespace = 'public'::regnamespace) THEN
        BEGIN
            EXECUTE format('ALTER FUNCTION public.custom_login(%s) SET search_path = public, pg_temp',
                (SELECT pg_get_function_identity_arguments(oid) FROM pg_proc 
                 WHERE proname = 'custom_login' AND pronamespace = 'public'::regnamespace LIMIT 1));
            update_count := update_count + 1;
            RAISE NOTICE 'Updated function: custom_login';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not update custom_login: %', SQLERRM;
        END;
    END IF;

    DROP TABLE functions_to_update;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Security fixes applied successfully!';
    RAISE NOTICE 'Total functions updated: %', update_count;
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANT: You still need to update Auth settings in Supabase Dashboard:';
    RAISE NOTICE '1. Set OTP expiry to <= 3600 seconds (Authentication > Providers > Email)';
    RAISE NOTICE '2. Enable Leaked Password Protection (Authentication > Settings > Security)';
END $$;

-- 3. Show remaining functions that might need attention
SELECT 
    'The following functions may still need search_path set:' as message,
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND p.prosecdef = false
AND (p.proconfig IS NULL OR NOT ('search_path' = ANY(string_to_array(array_to_string(p.proconfig, ','), '='))));