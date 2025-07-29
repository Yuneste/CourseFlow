import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CourseFormClient } from './course-form-client';

export default async function NewCoursePage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile for academic system info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect('/onboarding');
  }

  return <CourseFormClient userProfile={profile} />;
}