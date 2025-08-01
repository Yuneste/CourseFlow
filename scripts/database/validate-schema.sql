-- Database Schema Validation Script for CourseFlow
-- This script validates that all required tables, columns, and constraints exist
-- Run this to check if all migrations have been applied successfully

-- Create validation results table
CREATE TEMP TABLE IF NOT EXISTS validation_results (
    check_name TEXT,
    status TEXT,
    details TEXT
);

-- Function to check if table exists
CREATE OR REPLACE FUNCTION check_table_exists(p_schema_name TEXT, p_table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = p_schema_name AND table_name = p_table_name
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if column exists
CREATE OR REPLACE FUNCTION check_column_exists(p_schema_name TEXT, p_table_name TEXT, p_column_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = p_schema_name 
        AND table_name = p_table_name 
        AND column_name = p_column_name
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VALIDATE PROFILES TABLE
-- =====================================================
DO $$
BEGIN
    -- Check table exists
    IF check_table_exists('public', 'profiles') THEN
        INSERT INTO validation_results VALUES ('profiles table', 'PASS', 'Table exists');
        
        -- Check required columns
        IF NOT check_column_exists('public', 'profiles', 'id') THEN
            INSERT INTO validation_results VALUES ('profiles.id', 'FAIL', 'Column missing');
        END IF;
        
        IF NOT check_column_exists('public', 'profiles', 'email') THEN
            INSERT INTO validation_results VALUES ('profiles.email', 'FAIL', 'Column missing');
        END IF;
        
        IF NOT check_column_exists('public', 'profiles', 'subscription_tier') THEN
            INSERT INTO validation_results VALUES ('profiles.subscription_tier', 'FAIL', 'Column missing');
        END IF;
        
        IF NOT check_column_exists('public', 'profiles', 'stripe_customer_id') THEN
            INSERT INTO validation_results VALUES ('profiles.stripe_customer_id', 'FAIL', 'Column missing');
        END IF;
        
        IF NOT check_column_exists('public', 'profiles', 'has_access') THEN
            INSERT INTO validation_results VALUES ('profiles.has_access', 'FAIL', 'Column missing');
        END IF;
        
    ELSE
        INSERT INTO validation_results VALUES ('profiles table', 'FAIL', 'Table does not exist');
    END IF;
END $$;

-- =====================================================
-- VALIDATE COURSES TABLE
-- =====================================================
DO $$
BEGIN
    IF check_table_exists('public', 'courses') THEN
        INSERT INTO validation_results VALUES ('courses table', 'PASS', 'Table exists');
        
        -- Check unique constraint
        IF EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'unique_user_course_term'
        ) THEN
            INSERT INTO validation_results VALUES ('courses unique constraint', 'PASS', 'Constraint exists');
        ELSE
            INSERT INTO validation_results VALUES ('courses unique constraint', 'FAIL', 'unique_user_course_term missing');
        END IF;
        
    ELSE
        INSERT INTO validation_results VALUES ('courses table', 'FAIL', 'Table does not exist');
    END IF;
END $$;

-- =====================================================
-- VALIDATE FILES TABLE
-- =====================================================
DO $$
BEGIN
    IF check_table_exists('public', 'files') THEN
        INSERT INTO validation_results VALUES ('files table', 'PASS', 'Table exists');
        
        -- Check for file_hash column (security feature)
        IF check_column_exists('public', 'files', 'file_hash') THEN
            INSERT INTO validation_results VALUES ('files.file_hash', 'PASS', 'Column exists');
        ELSE
            INSERT INTO validation_results VALUES ('files.file_hash', 'FAIL', 'Column missing - duplicate detection unavailable');
        END IF;
        
    ELSE
        INSERT INTO validation_results VALUES ('files table', 'FAIL', 'Table does not exist');
    END IF;
END $$;

-- =====================================================
-- VALIDATE COURSE_FOLDERS TABLE
-- =====================================================
DO $$
BEGIN
    IF check_table_exists('public', 'course_folders') THEN
        INSERT INTO validation_results VALUES ('course_folders table', 'PASS', 'Table exists');
    ELSE
        INSERT INTO validation_results VALUES ('course_folders table', 'FAIL', 'Table does not exist');
    END IF;
END $$;

-- =====================================================
-- VALIDATE UPLOAD_ANALYTICS TABLE
-- =====================================================
DO $$
BEGIN
    IF check_table_exists('public', 'upload_analytics') THEN
        INSERT INTO validation_results VALUES ('upload_analytics table', 'PASS', 'Table exists');
    ELSE
        INSERT INTO validation_results VALUES ('upload_analytics table', 'FAIL', 'Table does not exist');
    END IF;
END $$;

-- =====================================================
-- VALIDATE VIEWS
-- =====================================================
DO $$
BEGIN
    -- Check user_subscription_status view
    IF EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'user_subscription_status'
    ) THEN
        INSERT INTO validation_results VALUES ('user_subscription_status view', 'PASS', 'View exists');
    ELSE
        INSERT INTO validation_results VALUES ('user_subscription_status view', 'FAIL', 'View does not exist');
    END IF;
    
    -- Check current_semester_info view
    IF EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'current_semester_info'
    ) THEN
        INSERT INTO validation_results VALUES ('current_semester_info view', 'PASS', 'View exists');
        
        -- Check if view uses security_invoker
        IF EXISTS (
            SELECT 1 FROM pg_views 
            WHERE schemaname = 'public' 
            AND viewname = 'current_semester_info'
            AND definition LIKE '%security_invoker%'
        ) THEN
            INSERT INTO validation_results VALUES ('current_semester_info security', 'PASS', 'View uses security_invoker');
        ELSE
            INSERT INTO validation_results VALUES ('current_semester_info security', 'WARNING', 'View may not use security_invoker');
        END IF;
    ELSE
        INSERT INTO validation_results VALUES ('current_semester_info view', 'FAIL', 'View does not exist');
    END IF;
END $$;

-- =====================================================
-- VALIDATE FUNCTIONS
-- =====================================================
DO $$
BEGIN
    -- Check critical functions
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user' AND pronamespace = 'public'::regnamespace) THEN
        INSERT INTO validation_results VALUES ('handle_new_user function', 'PASS', 'Function exists');
    ELSE
        INSERT INTO validation_results VALUES ('handle_new_user function', 'FAIL', 'Function does not exist');
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at' AND pronamespace = 'public'::regnamespace) THEN
        INSERT INTO validation_results VALUES ('handle_updated_at function', 'PASS', 'Function exists');
    ELSE
        INSERT INTO validation_results VALUES ('handle_updated_at function', 'FAIL', 'Function does not exist');
    END IF;
END $$;

-- =====================================================
-- VALIDATE RLS POLICIES
-- =====================================================
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Check if RLS is enabled on critical tables
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND rowsecurity = true
    ) THEN
        INSERT INTO validation_results VALUES ('profiles RLS', 'PASS', 'RLS enabled');
    ELSE
        INSERT INTO validation_results VALUES ('profiles RLS', 'FAIL', 'RLS not enabled - SECURITY RISK');
    END IF;
    
    -- Count policies on profiles table
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles';
    
    IF policy_count >= 2 THEN
        INSERT INTO validation_results VALUES ('profiles policies', 'PASS', policy_count || ' policies found');
    ELSE
        INSERT INTO validation_results VALUES ('profiles policies', 'WARNING', 'Only ' || policy_count || ' policies found');
    END IF;
END $$;

-- =====================================================
-- VALIDATE INDEXES
-- =====================================================
DO $$
BEGIN
    -- Check critical indexes exist
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'files' 
        AND indexname = 'idx_files_user_id'
    ) THEN
        INSERT INTO validation_results VALUES ('files user_id index', 'PASS', 'Index exists');
    ELSE
        INSERT INTO validation_results VALUES ('files user_id index', 'WARNING', 'Index missing - may impact performance');
    END IF;
END $$;

-- =====================================================
-- CHECK FOR MISSING DOCUMENTED TABLES
-- =====================================================
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[
        'study_sessions',
        'flashcards', 
        'groups',
        'group_members',
        'shared_files',
        'subscriptions',
        'usage_tracking',
        'grades',
        'academic_terms',
        'translations',
        'user_preferences'
    ];
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY missing_tables
    LOOP
        IF NOT check_table_exists('public', table_name) THEN
            INSERT INTO validation_results VALUES (
                table_name || ' table', 
                'INFO', 
                'Documented but not implemented'
            );
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- CHECK STORAGE BUCKETS
-- =====================================================
DO $$
BEGIN
    -- Check if storage schema exists
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
        -- Check for user-files bucket (the actual bucket used in the codebase)
        IF EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'user-files') THEN
            INSERT INTO validation_results VALUES ('user-files bucket', 'PASS', 'Storage bucket exists');
        ELSE
            INSERT INTO validation_results VALUES ('user-files bucket', 'FAIL', 'Storage bucket does not exist');
        END IF;
        
        -- Check bucket has proper configuration
        IF EXISTS (
            SELECT 1 FROM storage.buckets 
            WHERE name = 'user-files' 
            AND public = false
        ) THEN
            INSERT INTO validation_results VALUES ('user-files bucket security', 'PASS', 'Bucket is private');
        ELSE
            INSERT INTO validation_results VALUES ('user-files bucket security', 'WARNING', 'Bucket might be public');
        END IF;
    ELSE
        INSERT INTO validation_results VALUES ('storage schema', 'WARNING', 'Storage schema not accessible');
    END IF;
END $$;

-- =====================================================
-- DISPLAY VALIDATION RESULTS
-- =====================================================
SELECT 
    status,
    check_name,
    details
FROM validation_results
ORDER BY 
    CASE status 
        WHEN 'FAIL' THEN 1
        WHEN 'WARNING' THEN 2
        WHEN 'INFO' THEN 3
        WHEN 'PASS' THEN 4
    END,
    check_name;

-- Summary counts
SELECT 
    status,
    COUNT(*) as count
FROM validation_results
GROUP BY status
ORDER BY 
    CASE status 
        WHEN 'FAIL' THEN 1
        WHEN 'WARNING' THEN 2
        WHEN 'INFO' THEN 3
        WHEN 'PASS' THEN 4
    END;

-- Critical issues that need immediate attention
SELECT 
    '⚠️ CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:' as message
WHERE EXISTS (SELECT 1 FROM validation_results WHERE status = 'FAIL');

SELECT 
    check_name || ': ' || details as critical_issue
FROM validation_results 
WHERE status = 'FAIL';

-- Cleanup
DROP FUNCTION IF EXISTS check_table_exists(TEXT, TEXT);
DROP FUNCTION IF EXISTS check_column_exists(TEXT, TEXT, TEXT);