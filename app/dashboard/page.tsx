import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileDropdown } from '@/components/features/profile/ProfileDropdown'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's courses
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Check if user has completed onboarding (has at least one course)
  const hasCompletedOnboarding = courses && courses.length > 0

  // If user hasn't completed onboarding, redirect to onboarding
  if (!hasCompletedOnboarding) {
    redirect('/onboarding')
  }

  // Get user profile for academic system info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FA8072] to-[#FF6B6B] bg-clip-text text-transparent">
              Dashboard
            </h1>
            {profile?.full_name && (
              <p className="text-gray-600 mt-1">
                Welcome back, {profile.full_name}!
              </p>
            )}
          </div>
          <ProfileDropdown user={user} profile={profile} />
        </div>
        
        <DashboardClient 
          initialCourses={courses || []} 
          userProfile={profile}
        />
      </div>
    </div>
  )
}