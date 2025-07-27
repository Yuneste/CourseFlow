import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if files table exists
    const { data: tables, error: tableError } = await supabase
      .from('files')
      .select('id')
      .limit(1);

    const filesTableExists = !tableError || !tableError.message.includes('relation "public.files" does not exist');

    // Check if storage bucket exists
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();

    const userFilesBucketExists = buckets?.some(bucket => bucket.name === 'user-files') || false;

    // Try to list files in bucket (to check permissions)
    let canListFiles = false;
    if (userFilesBucketExists) {
      const { error: listError } = await supabase
        .storage
        .from('user-files')
        .list(user.id);
      
      canListFiles = !listError;
    }

    return NextResponse.json({
      debug: {
        filesTableExists,
        filesTableError: tableError?.message,
        userFilesBucketExists,
        buckets: buckets?.map(b => b.name),
        canListFiles,
        userId: user.id,
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Debug check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}