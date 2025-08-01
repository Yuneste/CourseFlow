import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { lightThemeClasses } from '@/lib/theme/light-theme'

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
    <div className={lightThemeClasses.page.wrapper}>
      <div className={lightThemeClasses.page.container + " py-8"}>
        {children}
      </div>
    </div>
  )
}