import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  validateFileType, 
  validateFileSize, 
  validateMagicBytes,
  calculateFileHash,
  sanitizeFilename,
  detectAcademicContent,
  ALLOWED_MIME_TYPES
} from '@/lib/utils/file-validation';
import { checkRateLimit } from '@/lib/rate-limit';
import type { File as FileType } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply general rate limiting
    const rateLimit = await checkRateLimit(req, user.id, 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Parse form data
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const courseId = formData.get('course_id') as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Validate batch size
    if (files.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 files can be uploaded at once' }, { status: 400 });
    }

    const uploadResults: (FileType | { error: string; filename: string })[] = [];

    // Process each file
    for (const file of files) {
      try {
        // Validate file type
        const typeValidation = validateFileType(file);
        if (!typeValidation.valid) {
          uploadResults.push({ error: typeValidation.error!, filename: file.name });
          continue;
        }

        // Apply type-specific rate limiting
        const fileCategory = typeValidation.category;
        const typeLimit = fileCategory === 'image' ? 10 : 20;
        const typeRateLimit = await checkRateLimit(req, `${user.id}:${fileCategory}`, typeLimit, 60 * 1000);
        if (!typeRateLimit.allowed) {
          uploadResults.push({ error: `${fileCategory} upload rate limit exceeded`, filename: file.name });
          continue;
        }

        // Validate file size
        const sizeValidation = validateFileSize(file);
        if (!sizeValidation.valid) {
          uploadResults.push({ error: sizeValidation.error!, filename: file.name });
          continue;
        }

        // Validate magic bytes
        const magicValidation = await validateMagicBytes(file);
        if (!magicValidation.valid) {
          uploadResults.push({ error: magicValidation.error!, filename: file.name });
          continue;
        }

        // Calculate file hash for deduplication
        const fileHash = await calculateFileHash(file);

        // Check for duplicates
        const { data: existingFile } = await supabase
          .from('files')
          .select('id, display_name, created_at')
          .eq('user_id', user.id)
          .eq('file_hash', fileHash)
          .single();

        if (existingFile) {
          uploadResults.push({ 
            error: `Duplicate file already exists: ${existingFile.display_name}`, 
            filename: file.name 
          });
          continue;
        }

        // Detect academic content for images
        let isAcademicContent = true;
        if (fileCategory === 'image') {
          const analysis = await detectAcademicContent(file);
          isAcademicContent = analysis.isAcademic;
        }

        // Generate unique storage path
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const sanitizedName = sanitizeFilename(file.name);
        const storagePath = `${user.id}/${courseId || 'uncategorized'}/${timestamp}-${randomStr}-${sanitizedName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-files')
          .upload(storagePath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          console.error('Storage path:', storagePath);
          console.error('File type:', file.type);
          console.error('File size:', file.size);
          uploadResults.push({ 
            error: `Failed to upload file to storage: ${uploadError.message}`, 
            filename: file.name 
          });
          continue;
        }

        // Get public URL for the file
        const { data: { publicUrl } } = supabase.storage
          .from('user-files')
          .getPublicUrl(storagePath);

        // Save file metadata to database
        const fileRecord = {
          user_id: user.id,
          course_id: courseId,
          original_name: file.name,
          display_name: file.name,
          storage_url: storagePath,
          file_type: file.type,
          file_size: file.size,
          file_hash: fileHash,
          upload_source: 'web' as const,
          is_academic_content: isAcademicContent,
        };

        const { data: savedFile, error: dbError } = await supabase
          .from('files')
          .insert(fileRecord)
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          // Try to clean up the uploaded file
          await supabase.storage.from('user-files').remove([storagePath]);
          uploadResults.push({ error: 'Failed to save file metadata', filename: file.name });
          continue;
        }

        // Track upload analytics
        await supabase.from('upload_analytics').insert({
          user_id: user.id,
          file_id: savedFile.id,
          upload_status: 'completed',
          file_type: file.type,
          file_size: file.size,
          upload_duration_ms: 0, // Would be calculated in real implementation
          client_info: {
            userAgent: req.headers.get('user-agent'),
          },
        });

        uploadResults.push(savedFile);

      } catch (fileError) {
        console.error('Error processing file:', file.name, fileError);
        uploadResults.push({ error: 'Failed to process file', filename: file.name });
      }
    }

    // Return results
    const successfulUploads = uploadResults.filter(r => !('error' in r));
    const failedUploads = uploadResults.filter(r => 'error' in r);

    if (successfulUploads.length === 0) {
      return NextResponse.json({ 
        error: 'All files failed to upload', 
        details: failedUploads 
      }, { status: 400 });
    }

    return NextResponse.json({
      files: successfulUploads,
      errors: failedUploads.length > 0 ? failedUploads : undefined,
    });

  } catch (error) {
    console.error('Unexpected error in POST /api/files/upload:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// OPTIONS method for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}