import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Globe, Shield, ChevronLeft } from 'lucide-react'

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
          <Button variant="ghost" className="mb-4 hover:bg-[#F0C4C0]/10 text-[#1a1a1a]">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-[#1a1a1a]">
          Settings
        </h1>
        <p className="text-[#C7C7AD] mt-1">Manage your account preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/settings/profile">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-[#C7C7AD] bg-white/95 border-[#C7C7AD]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1a1a1a]">
                <User className="h-5 w-5 text-[#1a1a1a]" />
                Profile Settings
              </CardTitle>
              <CardDescription className="text-[#C7C7AD]">
                Update your personal information
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/settings/country">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-[#C7C7AD] bg-white/95 border-[#C7C7AD]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1a1a1a]">
                <Globe className="h-5 w-5 text-[#1a1a1a]" />
                Country & Region
              </CardTitle>
              <CardDescription className="text-[#C7C7AD]">
                Change your location and academic system
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/settings/privacy">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-[#C7C7AD] bg-white/95 border-[#C7C7AD]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1a1a1a]">
                <Shield className="h-5 w-5 text-[#1a1a1a]" />
                Privacy & Security
              </CardTitle>
              <CardDescription className="text-[#C7C7AD]">
                Manage your account security
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </>
  )
}