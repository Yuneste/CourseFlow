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
  
  const { data: { user } } = await supabase.auth.getUser()

  // If not logged in, show landing page
  if (!user) {
    redirect('/landing')
  }
  
  // If user is logged in, check if they need onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('study_program, degree_type')
    .eq('id', user.id)
    .single()
  
  // Check if user has completed basic profile setup
  if (!profile?.study_program || !profile?.degree_type) {
    redirect('/onboarding')
  }
  
  // Check if user has any courses
  const { data: courses } = await supabase
    .from('courses')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
  
  if (!courses || courses.length === 0) {
    redirect('/onboarding')
  }
  
  // User has completed onboarding, go to dashboard
  redirect('/dashboard')
}