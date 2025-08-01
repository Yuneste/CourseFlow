import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CourseDetailClient } from './course-detail-client';

export default async function CoursePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // Fetch course details
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (courseError || !course) {
    redirect('/dashboard');
  }

  // Fetch course folders
  const { data: folders = [] } = await supabase
    .from('course_folders')
    .select('*')
    .eq('course_id', params.id)
    .order('display_order');

  // Remove any duplicate folders (in case of data issues)
  const uniqueFolders = folders ? Array.from(
    new Map(folders.map(folder => [folder.name, folder])).values()
  ) : [];

  // Fetch files for this course
  const { data: files = [] } = await supabase
    .from('files')
    .select('*')
    .eq('course_id', params.id)
    .order('created_at', { ascending: false });

  return <CourseDetailClient course={course} folders={uniqueFolders} files={files || []} />;
}