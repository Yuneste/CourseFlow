import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  validateFileType, 
  validateFileSize, 
  validateMagicBytes,
  calculateFileHash,
  sanitizeFilename,
  ALLOWED_MIME_TYPES
} from '@/lib/utils/file-validation';
import { categorizeFile, getCategoryFolder } from '@/lib/utils/file-categorization';
import { logger } from '@/lib/logger';
import { FILE_UPLOAD, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants';
import type { File as FileType } from '@/types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Types for better type safety
interface UploadRequest {
  files: File[];
  courseId: string | null;
  folderId: string | null;
}

interface UploadResult {
  file?: FileType;
  error?: string;
  filename: string;
}

interface FileValidationResult {
  isValid: boolean;
  error?: string;
  category?: string;
}

interface FileMetadata {
  user_id: string;
  course_id: string | null;
  folder_id: string | null;
  original_name: string;
  display_name: string;
  storage_url: string;
  file_type: string;
  file_size: number;
  file_hash: string;
  upload_source: 'web';
  is_academic_content: boolean;
  ai_category: string;
}

// Authentication handler
async function authenticateUser(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    logger.warn('Unauthorized file upload attempt', { error });
    return null;
  }
  
  return user;
}

// Request validation
function validateUploadRequest(files: File[]): { isValid: boolean; error?: string } {
  if (!files || files.length === 0) {
    return { isValid: false, error: ERROR_MESSAGES.GENERIC };
  }

  if (files.length > FILE_UPLOAD.MAX_BATCH_SIZE) {
    return { 
      isValid: false, 
      error: `Maximum ${FILE_UPLOAD.MAX_BATCH_SIZE} files can be uploaded at once` 
    };
  }

  return { isValid: true };
}

// File validation pipeline
async function validateFile(file: File): Promise<FileValidationResult> {
  // Validate file type
  const typeValidation = validateFileType(file);
  if (!typeValidation.valid) {
    return { isValid: false, error: typeValidation.error };
  }

  // Validate file size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    return { isValid: false, error: sizeValidation.error };
  }

  // Validate magic bytes
  const magicValidation = await validateMagicBytes(file);
  if (!magicValidation.valid) {
    return { isValid: false, error: magicValidation.error };
  }

  return { isValid: true, category: typeValidation.category };
}

// Check for duplicate files
async function checkDuplicateFile(
  supabase: SupabaseClient,
  userId: string,
  fileHash: string,
  courseId?: string | null
): Promise<{ isDuplicate: boolean; existingFileName?: string }> {
  // Check general duplicates
  const { data: existingFile } = await supabase
    .from('files')
    .select('id, display_name')
    .eq('user_id', userId)
    .eq('file_hash', fileHash)
    .single();

  if (existingFile) {
    return { 
      isDuplicate: true, 
      existingFileName: existingFile.display_name 
    };
  }

  // Check course-specific duplicates
  if (courseId) {
    const { data: courseFile } = await supabase
      .from('files')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('file_hash', fileHash)
      .single();

    if (courseFile) {
      return { isDuplicate: true };
    }
  }

  return { isDuplicate: false };
}

// Generate storage path
function generateStoragePath(
  userId: string,
  fileName: string,
  categoryFolder: string,
  courseId?: string | null
): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const sanitizedName = sanitizeFilename(fileName);
  
  return courseId 
    ? `${userId}/${courseId}/${categoryFolder}/${timestamp}-${randomStr}-${sanitizedName}`
    : `${userId}/general/${categoryFolder}/${timestamp}-${randomStr}-${sanitizedName}`;
}

// Upload file to storage
async function uploadToStorage(
  supabase: SupabaseClient,
  file: File,
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.storage
    .from('user-files')
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    logger.error('Storage upload failed', error, {
      storagePath,
      fileType: file.type,
      fileSize: file.size,
    });
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Save file metadata to database
async function saveFileMetadata(
  supabase: SupabaseClient,
  metadata: FileMetadata
): Promise<{ file?: FileType; error?: string }> {
  const { data, error } = await supabase
    .from('files')
    .insert(metadata)
    .select()
    .single();

  if (error) {
    logger.error('Failed to save file metadata', error, { metadata });
    return { error: 'Failed to save file metadata' };
  }

  return { file: data };
}

// Track upload analytics
async function trackUploadAnalytics(
  supabase: SupabaseClient,
  userId: string,
  fileId: string,
  file: File,
  userAgent: string | null
): Promise<void> {
  try {
    await supabase.from('upload_analytics').insert({
      user_id: userId,
      file_id: fileId,
      upload_status: 'completed',
      file_type: file.type,
      file_size: file.size,
      upload_duration_ms: 0, // Would be calculated in real implementation
      client_info: { userAgent },
    });
  } catch (error) {
    logger.warn('Failed to track upload analytics', { error, fileId });
  }
}

// Process single file upload
async function processFileUpload(
  supabase: SupabaseClient,
  file: File,
  userId: string,
  courseId: string | null,
  folderId: string | null,
  userAgent: string | null
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = await validateFile(file);
    if (!validation.isValid) {
      return { error: validation.error, filename: file.name };
    }

    // Calculate file hash
    const fileHash = await calculateFileHash(file);

    // Check for duplicates
    const duplicateCheck = await checkDuplicateFile(supabase, userId, fileHash, courseId);
    if (duplicateCheck.isDuplicate) {
      const error = duplicateCheck.existingFileName
        ? `Duplicate file already exists: ${duplicateCheck.existingFileName}`
        : 'This file already exists in this course';
      return { error, filename: file.name };
    }

    // Categorize file
    const aiCategory = categorizeFile(file.name);
    const categoryFolder = getCategoryFolder(aiCategory);

    // Generate storage path
    const storagePath = generateStoragePath(userId, file.name, categoryFolder, courseId);

    // Upload to storage
    const uploadResult = await uploadToStorage(supabase, file, storagePath);
    if (!uploadResult.success) {
      return { 
        error: `Failed to upload file to storage: ${uploadResult.error}`, 
        filename: file.name 
      };
    }

    // Prepare file metadata
    const metadata: FileMetadata = {
      user_id: userId,
      course_id: courseId,
      folder_id: folderId,
      original_name: file.name,
      display_name: file.name,
      storage_url: storagePath,
      file_type: file.type,
      file_size: file.size,
      file_hash: fileHash,
      upload_source: 'web',
      is_academic_content: true, // For MVP, all content is considered valid
      ai_category: aiCategory,
    };

    // Save to database
    const { file: savedFile, error: dbError } = await saveFileMetadata(supabase, metadata);
    if (dbError) {
      // Clean up uploaded file on database error
      await supabase.storage.from('user-files').remove([storagePath]);
      return { error: dbError, filename: file.name };
    }

    // Track analytics
    if (savedFile) {
      await trackUploadAnalytics(supabase, userId, savedFile.id, file, userAgent);
    }

    return { file: savedFile, filename: file.name };

  } catch (error) {
    logger.error('Error processing file upload', error, { filename: file.name });
    return { error: 'Failed to process file', filename: file.name };
  }
}

// Format upload response
function formatUploadResponse(results: UploadResult[]) {
  const successfulUploads = results.filter(r => r.file).map(r => r.file!);
  const failedUploads = results.filter(r => r.error);

  if (successfulUploads.length === 0) {
    return {
      success: false,
      status: 400,
      body: {
        error: 'All files failed to upload',
        details: failedUploads,
      },
    };
  }

  return {
    success: true,
    status: 200,
    body: {
      files: successfulUploads,
      errors: failedUploads.length > 0 ? failedUploads : undefined,
    },
  };
}

// Add security headers to response
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Content-Security-Policy', "default-src 'self'; img-src 'self' blob: data:; script-src 'self'");
  return response;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const supabase = await createClient();
    
    // Authenticate user
    const user = await authenticateUser(supabase);
    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 });
    }

    logger.info('File upload request', { userId: user.id });

    // Parse form data
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const courseId = formData.get('course_id') as string | null;
    const folderId = formData.get('folder_id') as string | null;

    // Validate request
    const validation = validateUploadRequest(files);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Process each file
    const userAgent = req.headers.get('user-agent');

    // Process files in parallel for better performance
    const uploadPromises = files.map(file =>
      processFileUpload(
        supabase,
        file,
        user.id,
        courseId,
        folderId,
        userAgent
      )
    );

    const uploadResults = await Promise.all(uploadPromises);

    // Format response
    const responseData = formatUploadResponse(uploadResults);
    
    // Log completion
    const duration = Date.now() - startTime;
    logger.info('File upload completed', {
      userId: user.id,
      filesUploaded: uploadResults.filter(r => r.file).length,
      filesFailed: uploadResults.filter(r => r.error).length,
      duration: `${duration}ms`,
    });

    // Create and return response with security headers
    const response = NextResponse.json(responseData.body, { status: responseData.status });
    return addSecurityHeaders(response);

  } catch (error) {
    logger.error('Unexpected error in file upload', error);
    return NextResponse.json({ error: ERROR_MESSAGES.GENERIC }, { status: 500 });
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