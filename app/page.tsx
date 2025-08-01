import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home({
  searchParams,
}: {
  searchParams: { code?: string; error?: string; error_description?: string }
}) {
  // Check if this is an OAuth callback
  if (searchParams.code) {
    // Redirect to auth callback with the code
    redirect(`/auth/callback?code=${searchParams.code}`)
  }

  // Check if there's an OAuth error
  if (searchParams.error) {
    redirect(`/login?error=${searchParams.error}`)
  }

  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  // If not logged in or error getting user, show landing page
  if (!user || error) {
    redirect('/landing')
  }
  
  // Check if user needs onboarding
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()
  
  // If there's an error fetching the profile or profile doesn't exist, redirect to onboarding
  if (profileError || !profile) {
    redirect('/onboarding')
  }
  
  // If onboarding is not completed, redirect to onboarding
  if (profile.onboarding_completed === false) {
    redirect('/onboarding')
  }
  
  // If user is logged in and onboarded, go to dashboard
  redirect('/dashboard')
}