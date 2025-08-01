import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UnifiedBackground, UnifiedSection } from '@/components/ui/unified-background'

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <UnifiedBackground>
      <UnifiedSection>
        {children}
      </UnifiedSection>
    </UnifiedBackground>
  )
}