-- Complete usage tracking setup with fixed indexes
-- This migration creates all usage tracking tables if they don't exist

-- Create ai_usage_logs table for tracking AI API calls and costs
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL, -- 'summary', 'flashcards', 'categorization', etc.
    tokens_used INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(10, 6) NOT NULL DEFAULT 0, -- Cost in EUR with 6 decimal places
    model TEXT NOT NULL, -- 'gpt-3.5-turbo', 'gpt-4-turbo', etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for ai_usage_logs (without problematic date_trunc)
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON public.ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON public.ai_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_created ON public.ai_usage_logs(user_id, created_at);

-- Create usage_tracking table for general usage metrics
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL, -- 'file_upload', 'study_session', 'group_created', etc.
    metric_value INTEGER NOT NULL DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for usage_tracking
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON public.usage_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_metric_type ON public.usage_tracking(metric_type);

-- Add student verification columns to profiles if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'student_discount_id') THEN
        ALTER TABLE public.profiles ADD COLUMN student_discount_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'student_verified_at') THEN
        ALTER TABLE public.profiles ADD COLUMN student_verified_at TIMESTAMPTZ;
    END IF;
END $$;

-- Create a view for monthly usage summary
CREATE OR REPLACE VIEW public.monthly_usage_summary AS
SELECT 
    p.id as user_id,
    p.email,
    p.subscription_tier,
    DATE_TRUNC('month', CURRENT_DATE) as month,
    -- File uploads this month
    COALESCE((
        SELECT COUNT(*)
        FROM public.files f
        WHERE f.user_id = p.id
        AND f.created_at >= DATE_TRUNC('month', CURRENT_DATE)
    ), 0) as files_uploaded,
    -- AI summaries this month
    COALESCE((
        SELECT COUNT(*)
        FROM public.ai_usage_logs a
        WHERE a.user_id = p.id
        AND a.feature = 'summary'
        AND a.created_at >= DATE_TRUNC('month', CURRENT_DATE)
    ), 0) as ai_summaries_used,
    -- Total AI cost this month
    COALESCE((
        SELECT SUM(cost)
        FROM public.ai_usage_logs a
        WHERE a.user_id = p.id
        AND a.created_at >= DATE_TRUNC('month', CURRENT_DATE)
    ), 0) as ai_cost_eur,
    -- Total storage used (MB)
    COALESCE((
        SELECT SUM(file_size) / (1024 * 1024)
        FROM public.files f
        WHERE f.user_id = p.id
    ), 0) as storage_used_mb
FROM public.profiles p;

-- Enable RLS on new tables
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_usage_logs
CREATE POLICY "Users can view their own AI usage logs"
    ON public.ai_usage_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI usage logs"
    ON public.ai_usage_logs FOR INSERT
    WITH CHECK (true); -- Service role will handle inserts

-- Create RLS policies for usage_tracking
CREATE POLICY "Users can view their own usage tracking"
    ON public.usage_tracking FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage tracking"
    ON public.usage_tracking FOR INSERT
    WITH CHECK (true); -- Service role will handle inserts

-- Create function to check for usage limit violations
CREATE OR REPLACE FUNCTION public.check_usage_limits(
    p_user_id UUID,
    p_metric_type TEXT,
    p_tier TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_usage INTEGER;
    v_limit INTEGER;
BEGIN
    -- This is a placeholder that returns true
    -- In production, implement actual limit checking based on tier
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-track file uploads
CREATE OR REPLACE FUNCTION public.track_file_upload()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usage_tracking (user_id, metric_type, metric_value, metadata)
    VALUES (
        NEW.user_id,
        'file_upload',
        1,
        jsonb_build_object(
            'file_id', NEW.id,
            'file_size', NEW.file_size,
            'file_type', NEW.file_type
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'track_file_upload_trigger') THEN
        CREATE TRIGGER track_file_upload_trigger
            AFTER INSERT ON public.files
            FOR EACH ROW
            EXECUTE FUNCTION public.track_file_upload();
    END IF;
END $$;

-- Add comments
COMMENT ON TABLE public.ai_usage_logs IS 'Tracks all AI API usage and associated costs per user';
COMMENT ON TABLE public.usage_tracking IS 'General usage metrics tracking for all platform features';
COMMENT ON VIEW public.monthly_usage_summary IS 'Aggregated monthly usage statistics per user';