import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CourseDetailClient } from './course-detail-client';

// Disable caching for this page to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CoursePage({ params }: { params: { id: string } }) {
  try {
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
  const { data: folders, error: foldersError } = await supabase
    .from('course_folders')
    .select('*')
    .eq('course_id', params.id)
    .order('display_order');

  if (foldersError) {
    console.error('Error fetching folders:', foldersError);
  }

  // Remove any duplicate folders (in case of data issues)
  const uniqueFolders = folders ? Array.from(
    new Map(folders.map(folder => [folder.name, folder])).values()
  ) : [];

  // Fetch files for this course
  const { data: files, error: filesError } = await supabase
    .from('files')
    .select('*')
    .eq('course_id', params.id)
    .order('created_at', { ascending: false });

  if (filesError) {
    console.error('Error fetching files:', filesError);
  }

  // Get user profile for academic system info
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('academic_system')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
  }

    return <CourseDetailClient 
      course={course} 
      folders={uniqueFolders} 
      files={files || []} 
      userAcademicSystem={profile?.academic_system}
    />;
  } catch (error) {
    console.error('Error in CoursePage:', error);
    // In production, Next.js will show a generic error page
    // In development, you'll see the actual error
    throw error;
  }
}