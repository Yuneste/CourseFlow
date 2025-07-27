import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const type = searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if this is a password recovery flow
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/update-password`)
      }
      
      // Check if user needs onboarding
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('study_program, degree_type')
          .eq('id', user.id)
          .single()
        
        // Check if user has completed basic profile setup
        if (!profile?.study_program || !profile?.degree_type) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
        
        // Check if user has any courses
        const { data: courses } = await supabase
          .from('courses')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
        
        if (!courses || courses.length === 0) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}