import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
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

    // Get the file to check ownership and get storage path
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Generate a signed URL for the file (valid for 1 hour)
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from('user-files')
      .createSignedUrl(file.storage_url, 3600); // 1 hour expiry

    if (urlError || !signedUrl) {
      console.error('Error creating signed URL:', urlError);
      return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
    }

    // Track download in analytics
    await supabase.from('upload_analytics').insert({
      user_id: user.id,
      file_id: fileId,
      upload_status: 'completed',
      file_type: file.file_type,
      file_size: file.file_size,
      client_info: {
        userAgent: req.headers.get('user-agent'),
        action: 'download',
      },
    });

    // Return the signed URL and file metadata
    return NextResponse.json({
      url: signedUrl.signedUrl,
      filename: file.display_name,
      contentType: file.file_type,
      size: file.file_size,
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/files/[id]/download:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}