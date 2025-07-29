import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const folderId = params.id;

    // Get the folder to verify ownership
    const { data: folder } = await supabase
      .from('course_folders')
      .select('id, course_id, is_special')
      .eq('id', folderId)
      .single();

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Don't allow deletion of special folders
    if (folder.is_special) {
      return NextResponse.json({ error: 'Cannot delete special folders' }, { status: 400 });
    }

    // Verify user owns the course
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('id', folder.course_id)
      .eq('user_id', user.id)
      .single();

    if (!course) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if folder has files
    const { count: fileCount } = await supabase
      .from('files')
      .select('*', { count: 'exact', head: true })
      .eq('folder_id', folderId);

    if (fileCount && fileCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete folder with files. Please move or delete all files first.' 
      }, { status: 400 });
    }

    // Check if folder has subfolders
    const { count: subfolderCount } = await supabase
      .from('course_folders')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', folderId);

    if (subfolderCount && subfolderCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete folder with subfolders. Please delete all subfolders first.' 
      }, { status: 400 });
    }

    // Delete the folder
    const { error: deleteError } = await supabase
      .from('course_folders')
      .delete()
      .eq('id', folderId);

    if (deleteError) {
      console.error('Error deleting folder:', deleteError);
      return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/courses/folders/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}