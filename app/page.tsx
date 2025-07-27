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

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }
  
  // If not logged in, redirect to login
  redirect('/login')
}