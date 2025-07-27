import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

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

  // Check if user has already completed full onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('study_program, degree_type')
    .eq('id', user.id)
    .single();

  const { count } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Only redirect if user has completed profile AND has courses
  if (profile?.study_program && profile?.degree_type && count && count > 0) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}