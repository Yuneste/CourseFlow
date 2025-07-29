import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/courses/[id] - Get a specific course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Unexpected error in GET /api/courses/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Update a course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting would go here

    // Parse request body
    const body = await request.json();

    // Validate required fields if provided
    if (body.name !== undefined) {
      if (!body.name || body.name.length < 2 || body.name.length > 100) {
        return NextResponse.json(
          { error: 'Course name must be between 2 and 100 characters' },
          { status: 400 }
        );
      }
    }

    if (body.term !== undefined && !body.term) {
      return NextResponse.json(
        { error: 'Term is required' },
        { status: 400 }
      );
    }

    if (body.code !== undefined && body.code && body.code.length > 20) {
      return NextResponse.json(
        { error: 'Course code must be 20 characters or less' },
        { status: 400 }
      );
    }

    if (body.professor !== undefined && body.professor && body.professor.length > 100) {
      return NextResponse.json(
        { error: 'Professor name must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Check if user owns the course
    const { data: existingCourse, error: fetchError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // If changing term, check term limit
    if (body.term) {
      const { count: termCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('term', body.term)
        .neq('id', params.id);

      if (termCount && termCount >= 20) {
        return NextResponse.json(
          { error: 'Term limit reached (20 courses per term maximum)' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    const allowedFields = [
      'name', 'code', 'professor', 'term', 'academic_period_type',
      'credits', 'ects_credits', 'color', 'emoji'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] === 'string' && body[field]) {
          updateData[field] = body[field].trim();
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Update course
    const { data: course, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      // Check for duplicate course constraint
      if (error.code === '23505' && error.message.includes('unique_user_course_term')) {
        return NextResponse.json(
          { error: 'A course with this name already exists in the selected term' },
          { status: 400 }
        );
      }
      
      console.error('Error updating course:', error);
      return NextResponse.json(
        { error: 'Failed to update course' },
        { status: 500 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Unexpected error in PUT /api/courses/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete a course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user owns the course
    const { data: existingCourse, error: fetchError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Delete course
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting course:', error);
      return NextResponse.json(
        { error: 'Failed to delete course' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Course deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in DELETE /api/courses/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}