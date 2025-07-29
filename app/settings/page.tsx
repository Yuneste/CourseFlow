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
          <Button variant="ghost" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/settings/profile">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="h-5 w-5 text-primary" />
                Profile Settings
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Update your personal information
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/settings/country">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Globe className="h-5 w-5 text-primary" />
                Country & Region
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Change your location and academic system
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/settings/privacy">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="h-5 w-5 text-primary" />
                Privacy & Security
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your account security
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </>
  )
}