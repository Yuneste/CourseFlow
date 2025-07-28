import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get hash and courseId from query params
    const { searchParams } = new URL(req.url);
    const hash = searchParams.get('hash');
    const courseId = searchParams.get('courseId');

    if (!hash) {
      return NextResponse.json({ error: 'Hash parameter required' }, { status: 400 });
    }

    // Check for existing file with same hash in the same course
    let query = supabase
      .from('files')
      .select('id, display_name, file_size, created_at, course_id')
      .eq('user_id', user.id)
      .eq('file_hash', hash);
    
    // If courseId provided, check only within that course
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    
    const { data: existingFile, error } = await query.single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking duplicate:', error);
      return NextResponse.json({ error: 'Failed to check duplicate' }, { status: 500 });
    }

    return NextResponse.json({
      isDuplicate: !!existingFile,
      existingFile: existingFile || null,
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/files/check-duplicate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}