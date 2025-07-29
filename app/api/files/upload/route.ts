import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/services/logger.service';
import { UploadService } from '@/lib/services/upload.service';
import { ERROR_MESSAGES } from '@/lib/constants';
import { rateLimit } from '@/lib/rate-limit';
import type { SupabaseClient } from '@supabase/supabase-js';

// Authentication handler
async function authenticateUser(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    logger.warn('Unauthorized file upload attempt', {
      action: 'authenticateUser',
      metadata: { error: error?.message }
    });
    return null;
  }
  
  return user;
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

    // Parse form data to check file types for rate limiting
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    
    // Determine rate limit based on file types
    const hasImages = files.some(f => f.type.startsWith('image/'));
    const rateConfig = hasImages 
      ? { limit: 10, windowMs: 60 * 1000 } // 10 images per minute
      : { limit: 20, windowMs: 60 * 1000 }; // 20 documents per minute
    
    // Apply rate limiting
    const rateLimitResult = await rateLimit(req, rateConfig);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many uploads. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toISOString(),
          }
        }
      );
    }

    logger.info('File upload request', {
      action: 'fileUpload',
      metadata: { userId: user.id }
    });

    // Get course and folder IDs from already parsed form data
    const courseId = formData.get('course_id') as string | null;
    const folderId = formData.get('folder_id') as string | null;

    // Validate request
    const validation = UploadService.validateRequest(files);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Process files using service
    const userAgent = req.headers.get('user-agent');
    const uploadResult = await UploadService.uploadBatch({
      files,
      courseId,
      folderId,
      userId: user.id,
      userAgent
    });

    // Determine response status
    const hasErrors = uploadResult.errors && uploadResult.errors.length > 0;
    const allFailed = uploadResult.files.length === 0;
    
    // Log completion
    const duration = Date.now() - startTime;
    logger.info('File upload completed', {
      action: 'fileUploadComplete',
      metadata: {
        userId: user.id,
        filesUploaded: uploadResult.files.length,
        filesFailed: uploadResult.errors?.length || 0,
        duration: `${duration}ms`,
      }
    });

    // Create response
    const status = allFailed ? 400 : 200;
    const responseBody = allFailed 
      ? { error: 'All files failed to upload', details: uploadResult.errors }
      : uploadResult;

    // Create and return response with security headers
    const response = NextResponse.json(responseBody, { status });
    return addSecurityHeaders(response);

  } catch (error) {
    logger.error('Unexpected error in file upload', error, {
      action: 'fileUploadError'
    });
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