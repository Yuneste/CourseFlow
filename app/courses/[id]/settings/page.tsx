import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CourseSettingsClient } from './settings-client';

export default async function CourseSettingsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // Verify course exists and belongs to user
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!course) {
    redirect('/dashboard');
  }

  return <CourseSettingsClient course={course} />;
}