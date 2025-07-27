import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-4">Welcome to CourseFlow</h1>
      <p className="text-lg text-muted-foreground">
        Hello, {user.email}! You&apos;re successfully logged in.
      </p>
      <p className="mt-4">
        This is your dashboard. More features coming soon!
      </p>
    </div>
  )
}