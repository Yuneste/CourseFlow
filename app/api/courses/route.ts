import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Course } from '@/types';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

// GET /api/courses - Get all courses for the authenticated user
export async function GET(request: NextRequest) {
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

    // Get optional term filter from query params
    const searchParams = request.nextUrl.searchParams;
    const term = searchParams.get('term');

    // Build query
    let query = supabase
      .from('courses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (term) {
      query = query.eq('term', term);
    }

    const { data: courses, error } = await query;

    if (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      );
    }

    return NextResponse.json(courses || []);
  } catch (error) {
    console.error('Unexpected error in GET /api/courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
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

    // Check rate limit for course creation (10 per minute)
    const rateLimit = await checkRateLimit(request, user.id, 10, 60 * 1000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: getRateLimitHeaders(10, rateLimit.remaining, rateLimit.resetTime)
        }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.term) {
      return NextResponse.json(
        { error: 'Course name and term are required' },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (body.name.length < 2 || body.name.length > 100) {
      return NextResponse.json(
        { error: 'Course name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    if (body.code && body.code.length > 20) {
      return NextResponse.json(
        { error: 'Course code must be 20 characters or less' },
        { status: 400 }
      );
    }

    if (body.professor && body.professor.length > 100) {
      return NextResponse.json(
        { error: 'Professor name must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Check course limit (100 total courses per user)
    const { count } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (count && count >= 100) {
      return NextResponse.json(
        { error: 'Course limit reached (100 courses maximum)' },
        { status: 400 }
      );
    }

    // Check term limit (20 courses per term)
    const { count: termCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('term', body.term);

    if (termCount && termCount >= 20) {
      return NextResponse.json(
        { error: 'Term limit reached (20 courses per term maximum)' },
        { status: 400 }
      );
    }

    // Prepare course data
    const courseData = {
      user_id: user.id,
      name: body.name.trim(),
      term: body.term,
      code: body.code?.trim() || null,
      professor: body.professor?.trim() || null,
      academic_period_type: body.academic_period_type || null,
      credits: body.credits || null,
      ects_credits: body.ects_credits || null,
      color: body.color || '#3B82F6',
      emoji: body.emoji || null,
    };

    // Insert course
    const { data: course, error } = await supabase
      .from('courses')
      .insert(courseData)
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
      
      console.error('Error creating course:', error);
      return NextResponse.json(
        { error: 'Failed to create course' },
        { status: 500 }
      );
    }

    // Create default folder structure for the course
    const defaultFolders = [
      { name: 'Lectures', display_order: 1, is_special: false },
      { name: 'Assignments', display_order: 2, is_special: false },
      { name: 'Notes', display_order: 3, is_special: false },
      { name: 'Exams', display_order: 4, is_special: false },
      { name: 'Documents', display_order: 5, is_special: false },
      { name: 'Resources', display_order: 6, is_special: true },
    ];
    
    const folderData = defaultFolders.map(folder => ({
      course_id: course.id,
      name: folder.name,
      path: folder.name.toLowerCase(),
      parent_id: null,
      display_order: folder.display_order,
      is_special: folder.is_special,
    }));
    
    const { error: folderError } = await supabase
      .from('course_folders')
      .insert(folderData);
    
    if (folderError) {
      console.error('Error creating default folders:', folderError);
      // Don't fail course creation if folder creation fails
    }

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}