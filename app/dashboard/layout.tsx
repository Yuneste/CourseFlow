import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayoutClient } from './dashboard-layout-client';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <DashboardLayoutClient
      user={{
        id: user.id,
        email: user.email!,
        full_name: profile?.full_name || null,
        onboarding_completed: profile?.onboarding_completed || false,
        created_at: new Date(user.created_at!),
        updated_at: new Date(user.updated_at!),
      }}
    >
      {children}
    </DashboardLayoutClient>
  );
}