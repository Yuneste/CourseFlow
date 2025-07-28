import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { course_id, name, parent_id } = body;

    if (!course_id || !name) {
      return NextResponse.json({ error: 'Course ID and folder name are required' }, { status: 400 });
    }

    // Verify user owns the course
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('id', course_id)
      .eq('user_id', user.id)
      .single();

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Get the next display order
    const { data: existingFolders } = await supabase
      .from('course_folders')
      .select('display_order')
      .eq('course_id', course_id)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = existingFolders && existingFolders.length > 0 
      ? (existingFolders[0].display_order || 0) + 1 
      : 7; // Start after default folders

    // Create the folder
    const { data: folder, error } = await supabase
      .from('course_folders')
      .insert({
        course_id,
        name: name.trim(),
        path: name.trim().toLowerCase().replace(/\s+/g, '-'),
        parent_id: parent_id || null,
        display_order: nextOrder,
        is_special: false,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A folder with this name already exists' }, { status: 400 });
      }
      console.error('Error creating folder:', error);
      return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
    }

    return NextResponse.json(folder);
  } catch (error) {
    console.error('Unexpected error in POST /api/courses/folders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}