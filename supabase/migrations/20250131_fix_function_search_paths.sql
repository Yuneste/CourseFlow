-- Fix function search path security warnings
-- This sets the search_path for all functions to prevent potential security issues

-- Update resend_confirmation_email function
ALTER FUNCTION public.resend_confirmation_email(email text)
SET search_path = public, pg_temp;

-- Update update_updated_at function
ALTER FUNCTION public.update_updated_at()
SET search_path = public, pg_temp;

-- Update update_updated_at_column function
ALTER FUNCTION public.update_updated_at_column()
SET search_path = public, pg_temp;

-- Update ensure_single_current_term function
ALTER FUNCTION public.ensure_single_current_term()
SET search_path = public, pg_temp;

-- Update get_or_create_profile function
ALTER FUNCTION public.get_or_create_profile(p_email text, p_full_name text)
SET search_path = public, pg_temp;

-- Update custom_login function
ALTER FUNCTION public.custom_login(email text, password text)
SET search_path = public, pg_temp;

-- Update auto_confirm_email function
ALTER FUNCTION public.auto_confirm_email()
SET search_path = public, pg_temp;

-- Update handle_new_user function
ALTER FUNCTION public.handle_new_user()
SET search_path = public, pg_temp;

-- Update handle_oauth_user_profile function
ALTER FUNCTION public.handle_oauth_user_profile()
SET search_path = public, pg_temp;

-- Add comment explaining the security fix
COMMENT ON SCHEMA public IS 'Public schema with fixed function search paths for security';