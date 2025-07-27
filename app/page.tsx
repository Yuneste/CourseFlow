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
  
  // If user is logged in, always go to dashboard
  // The dashboard will handle redirecting to onboarding if needed
  redirect('/dashboard')
}