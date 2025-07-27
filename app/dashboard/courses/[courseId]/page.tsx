import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CourseDetailClient } from './course-detail-client';

interface CoursePageProps {
  params: {
    courseId: string;
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/');
  }

  // Fetch course details
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.courseId)
    .eq('user_id', user.id)
    .single();

  if (courseError || !course) {
    redirect('/dashboard');
  }

  // Fetch files for this course
  const { data: files, error: filesError } = await supabase
    .from('files')
    .select('*')
    .eq('course_id', params.courseId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <CourseDetailClient 
      course={course} 
      initialFiles={files || []}
    />
  );
}