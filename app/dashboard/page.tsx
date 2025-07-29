import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './dashboard-client-v3'

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

  // Check if user has completed onboarding
  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#F0C4C0] via-[#ECF0C0] to-[#C0ECF0]">
      {/* Beautiful animated background */}
      <div className="absolute inset-0">
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#C4C0F0]/20 via-transparent to-[#F0C4C0]/20"></div>
        
        {/* Animated blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#ECF0C0] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#C0ECF0] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-[#C4C0F0] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <DashboardClient 
          initialCourses={courses || []} 
          userProfile={profile}
        />
      </div>
    </div>
  )
}