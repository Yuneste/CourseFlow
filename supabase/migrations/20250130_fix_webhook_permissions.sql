-- Create a policy that allows the service role to update profiles
-- This is needed for webhooks to update subscription status

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can update all profiles" ON public.profiles;

-- Create new policy for service role
CREATE POLICY "Service role can update all profiles" ON public.profiles
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Also ensure service role can select profiles
DROP POLICY IF EXISTS "Service role can view all profiles" ON public.profiles;

CREATE POLICY "Service role can view all profiles" ON public.profiles
  FOR SELECT
  TO service_role
  USING (true);