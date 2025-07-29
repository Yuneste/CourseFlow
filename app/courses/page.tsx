import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CoursesClient } from './courses-client'

export default async function CoursesPage() {
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

  return (
    <div className="min-h-screen bg-[#ECF0C0]">
      <CoursesClient 
        courses={courses || []} 
        userProfile={profile}
      />
    </div>
  )
}