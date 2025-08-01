import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './dashboard-client-redesigned'

// Disable caching for this page to ensure fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error in dashboard:', authError);
      redirect('/login')
    }

    if (!user) {
      redirect('/login')
    }

  // Fetch user's courses
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get user profile for academic system info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Check if user has completed onboarding
  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

    return (
      <DashboardClient 
        initialCourses={courses || []} 
        userProfile={profile}
      />
    )
  } catch (error) {
    console.error('Error in DashboardPage:', error);
    // If there's an error, we should still try to redirect to a safe page
    if (error instanceof Error && error.message.includes('NEXT_PUBLIC_SUPABASE')) {
      // Environment variable error - show a more specific error
      throw new Error('Application configuration error. Please contact support.');
    }
    throw error;
  }
}