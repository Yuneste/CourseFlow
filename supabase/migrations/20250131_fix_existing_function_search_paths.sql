-- Fix function search path security warnings for existing functions
-- Only updates functions that actually exist in the database

-- First, let's check which functions exist and update them
DO $$
BEGIN
    -- Update handle_new_user function if it exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user' AND pronamespace = 'public'::regnamespace) THEN
        ALTER FUNCTION public.handle_new_user()
        SET search_path = public, pg_temp;
        RAISE NOTICE 'Updated handle_new_user function';
    END IF;

    -- Update handle_updated_at function if it exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at' AND pronamespace = 'public'::regnamespace) THEN
        ALTER FUNCTION public.handle_updated_at()
        SET search_path = public, pg_temp;
        RAISE NOTICE 'Updated handle_updated_at function';
    END IF;

    -- Update delete_user_account function if it exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'delete_user_account' AND pronamespace = 'public'::regnamespace) THEN
        ALTER FUNCTION public.delete_user_account()
        SET search_path = public, pg_temp;
        RAISE NOTICE 'Updated delete_user_account function';
    END IF;

    -- Update delete_user function if it exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'delete_user' AND pronamespace = 'public'::regnamespace) THEN
        ALTER FUNCTION public.delete_user()
        SET search_path = public, pg_temp;
        RAISE NOTICE 'Updated delete_user function';
    END IF;

    -- Update create_default_course_folders function if it exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_default_course_folders' AND pronamespace = 'public'::regnamespace) THEN
        ALTER FUNCTION public.create_default_course_folders(course_id UUID)
        SET search_path = public, pg_temp;
        RAISE NOTICE 'Updated create_default_course_folders function';
    END IF;

    -- Update on_course_created function if it exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'on_course_created' AND pronamespace = 'public'::regnamespace) THEN
        ALTER FUNCTION public.on_course_created()
        SET search_path = public, pg_temp;
        RAISE NOTICE 'Updated on_course_created function';
    END IF;

    -- Check for other functions mentioned in the warnings
    -- These might be Supabase internal functions that we should update if they exist
    
    -- Update resend_confirmation_email if it exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'resend_confirmation_email' AND pronamespace = 'public'::regnamespace) THEN
        -- Get the function signature first
        EXECUTE format('ALTER FUNCTION public.resend_confirmation_email(%s) SET search_path = public, pg_temp',
            (SELECT pg_get_function_identity_arguments(oid) FROM pg_proc 
             WHERE proname = 'resend_confirmation_email' AND pronamespace = 'public'::regnamespace LIMIT 1));
        RAISE NOTICE 'Updated resend_confirmation_email function';
    END IF;

    -- Update update_updated_at if it exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at' AND pronamespace = 'public'::regnamespace) THEN
        ALTER FUNCTION public.update_updated_at()
        SET search_path = public, pg_temp;
        RAISE NOTICE 'Updated update_updated_at function';
    END IF;

    -- Update update_updated_at_column if it exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column' AND pronamespace = 'public'::regnamespace) THEN
        ALTER FUNCTION public.update_updated_at_column()
        SET search_path = public, pg_temp;
        RAISE NOTICE 'Updated update_updated_at_column function';
    END IF;

    -- Update ensure_single_current_term if it exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'ensure_single_current_term' AND pronamespace = 'public'::regnamespace) THEN
        ALTER FUNCTION public.ensure_single_current_term()
        SET search_path = public, pg_temp;
        RAISE NOTICE 'Updated ensure_single_current_term function';
    END IF;

    -- Update custom_login if it exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'custom_login' AND pronamespace = 'public'::regnamespace) THEN
        -- Get the function signature first
        EXECUTE format('ALTER FUNCTION public.custom_login(%s) SET search_path = public, pg_temp',
            (SELECT pg_get_function_identity_arguments(oid) FROM pg_proc 
             WHERE proname = 'custom_login' AND pronamespace = 'public'::regnamespace LIMIT 1));
        RAISE NOTICE 'Updated custom_login function';
    END IF;

    -- Update auto_confirm_email if it exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'auto_confirm_email' AND pronamespace = 'public'::regnamespace) THEN
        ALTER FUNCTION public.auto_confirm_email()
        SET search_path = public, pg_temp;
        RAISE NOTICE 'Updated auto_confirm_email function';
    END IF;

    -- Update handle_oauth_user_profile if it exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_oauth_user_profile' AND pronamespace = 'public'::regnamespace) THEN
        ALTER FUNCTION public.handle_oauth_user_profile()
        SET search_path = public, pg_temp;
        RAISE NOTICE 'Updated handle_oauth_user_profile function';
    END IF;
END $$;

-- List all functions that still need search_path set (for debugging)
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND p.prosecdef = false  -- not security definer
AND NOT EXISTS (
    SELECT 1 FROM pg_depend d
    WHERE d.objid = p.oid
    AND d.deptype = 'e'
)
AND p.proconfig IS NULL OR NOT ('search_path' = ANY(string_to_array(array_to_string(p.proconfig, ','), '=')))
ORDER BY p.proname;