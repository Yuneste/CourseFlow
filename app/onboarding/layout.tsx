import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UnifiedBackground, UnifiedSection } from '@/components/ui/unified-background';

export const metadata: Metadata = {
  title: 'Welcome to CourseFlow',
  description: 'Set up your courses and get started',
};

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Check if user has already completed onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single();

  // If user has already completed onboarding, redirect to dashboard
  if (profile?.onboarding_completed) {
    redirect('/dashboard');
  }

  return (
    <UnifiedBackground>
      <UnifiedSection>
        {children}
      </UnifiedSection>
    </UnifiedBackground>
  );
}