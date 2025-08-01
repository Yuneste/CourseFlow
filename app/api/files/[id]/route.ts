import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fileUpdateSchema } from '@/lib/security/input-validation';
import { z } from 'zod';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await req.json();
    
    // Handle both camelCase and snake_case conventions
    const normalizedBody = {
      ...body,
      course_id: body.course_id || body.courseId,
      folder_id: body.folder_id || body.folderId,
    };
    // Remove the camelCase versions to avoid duplication
    delete normalizedBody.courseId;
    delete normalizedBody.folderId;
    
    // Validate input
    const validation = fileUpdateSchema.safeParse(normalizedBody);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.flatten() 
      }, { status: 400 });
    }

    // Update file with validated data only
    const { data: file, error } = await supabase
      .from('files')
      .update(validation.data)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !file) {
      return NextResponse.json({ error: 'Failed to update file' }, { status: 400 });
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fileId = params.id;

    // First, get the file to check ownership and get storage path
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('user-files')
      .remove([file.storage_url]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/files/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}