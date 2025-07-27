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

  // Get user profile for academic system info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Check if user has completed onboarding (has at least one course)
  const hasCompletedOnboarding = courses && courses.length > 0

  // If user hasn't completed onboarding and has no profile data, redirect to onboarding
  // This allows users with profile data to access settings without being forced into onboarding
  if (!hasCompletedOnboarding && (!profile?.full_name || !profile?.country)) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Geometric pattern background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5F5] via-white to-[#FFF8F5]">
        {/* Diamond pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diamond-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="#FA8072" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diamond-pattern)" />
        </svg>
        
        {/* Subtle animated elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#FFE4E1] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-[#FFF0ED] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-[#FFEBE7] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
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