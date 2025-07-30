-- Add subscription fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'explorer' CHECK (subscription_tier IN ('explorer', 'scholar', 'master')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'canceled', 'past_due', 'trialing')),
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS has_access BOOLEAN DEFAULT FALSE;

-- Create index for faster Stripe lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);

-- Update the handle_new_user function to include subscription defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    subscription_tier,
    subscription_status,
    has_access
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    'explorer',
    'inactive',
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for easy subscription status checking
CREATE OR REPLACE VIEW public.user_subscription_status AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.subscription_tier,
  p.subscription_status,
  p.has_access,
  CASE 
    WHEN p.subscription_tier = 'explorer' THEN 0
    WHEN p.subscription_tier = 'scholar' THEN 10
    WHEN p.subscription_tier = 'master' THEN 25
  END AS monthly_price,
  CASE 
    WHEN p.subscription_tier = 'explorer' THEN 500 -- MB
    WHEN p.subscription_tier = 'scholar' THEN 5120 -- 5GB
    WHEN p.subscription_tier = 'master' THEN 51200 -- 50GB
  END AS storage_limit_mb,
  CASE 
    WHEN p.subscription_tier = 'explorer' THEN 10
    WHEN p.subscription_tier = 'scholar' THEN 100
    WHEN p.subscription_tier = 'master' THEN 500
  END AS ai_summaries_limit
FROM public.profiles p;

-- Grant permissions on the view
GRANT SELECT ON public.user_subscription_status TO authenticated;

-- Add RLS policy for the view
ALTER VIEW public.user_subscription_status SET (security_invoker = true);