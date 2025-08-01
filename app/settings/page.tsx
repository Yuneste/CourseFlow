import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Shield, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { lightTheme, lightThemeClasses, componentStyles } from '@/lib/theme/light-theme'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" className={cn(lightThemeClasses.button.ghost, "mb-4")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-[#3B82F6]">
          Settings
        </h1>
        <p className="text-gray-600 mt-1">Manage your account preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/settings/profile">
          <Card className={cn(lightThemeClasses.card.base, "hover:shadow-lg transition-shadow cursor-pointer hover:border-[#6366F1]/30")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <User className="h-5 w-5 text-[#6366F1]" />
                Profile Settings
              </CardTitle>
              <CardDescription className="text-gray-600">
                Update your personal information
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>


        <Link href="/settings/privacy">
          <Card className={cn(lightThemeClasses.card.base, "hover:shadow-lg transition-shadow cursor-pointer hover:border-[#6366F1]/30")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Shield className="h-5 w-5 text-[#6366F1]" />
                Privacy & Security
              </CardTitle>
              <CardDescription className="text-gray-600">
                Manage your account security
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </>
  )
}