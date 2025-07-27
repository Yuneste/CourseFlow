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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-orange-50">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FA8072] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFB6B0] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-[#FFDAB9] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FA8072] to-[#FF6B6B] bg-clip-text text-transparent">
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