import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { File } from '@/types';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    // Handle both snake_case and camelCase conventions
  const courseId = searchParams.get('course_id') || searchParams.get('courseId');

    // Build query
    let query = supabase
      .from('files')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Filter by course if specified
    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: files, error } = await query;

    if (error) {
      console.error('Error fetching files:', error);
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }

    return NextResponse.json(files || []);
  } catch (error) {
    console.error('Unexpected error in GET /api/files:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}