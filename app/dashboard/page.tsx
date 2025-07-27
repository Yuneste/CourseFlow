import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/logout-button'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Welcome to CourseFlow</h1>
        <LogoutButton />
      </div>
      <p className="text-lg text-muted-foreground">
        Hello, {user.email}! You&apos;re successfully logged in.
      </p>
      <p className="mt-4">
        This is your dashboard. More features coming soon!
      </p>
    </div>
  )
}