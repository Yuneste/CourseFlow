import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRateLimitForPath, parseWindow } from './rate-limits';
import { rateLimit as checkRateLimit } from '@/lib/rate-limit';

// Security middleware wrapper for API routes
export async function withSecurity(
  request: NextRequest,
  handler: (req: NextRequest, user: any) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    rateLimit?: boolean;
    validateInput?: (data: any) => { success: boolean; data?: any; error?: any };
  } = {}
) {
  const {
    requireAuth = true,
    requireAdmin = false,
    rateLimit = true,
    validateInput
  } = options;

  try {
    // 1. Apply rate limiting
    if (rateLimit) {
      const path = request.nextUrl.pathname;
      const limitConfig = getRateLimitForPath(path);
      
      if (limitConfig) {
        const limit = await checkRateLimit(request, {
          limit: limitConfig.requests,
          windowMs: parseWindow(limitConfig.window)
        });
        
        if (!limit.success) {
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { 
              status: 429, 
              headers: {
                'X-RateLimit-Limit': limit.limit.toString(),
                'X-RateLimit-Remaining': limit.remaining.toString(),
                'X-RateLimit-Reset': limit.reset.toISOString(),
                'Retry-After': Math.ceil((limit.reset.getTime() - Date.now()) / 1000).toString(),
              }
            }
          );
        }
      }
    }

    // 2. Check authentication
    if (requireAuth) {
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // 3. Check admin access if required
      if (requireAdmin) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();

        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        if (!profile || !adminEmails.includes(profile.email)) {
          return NextResponse.json(
            { error: 'Forbidden. Admin access required.' },
            { status: 403 }
          );
        }
      }

      // 4. Validate input if schema provided
      if (validateInput && request.method !== 'GET' && request.method !== 'DELETE') {
        const data = await request.json();
        const validation = validateInput(data);
        
        if (!validation.success) {
          return NextResponse.json(
            { 
              error: 'Invalid input',
              details: validation.error
            },
            { status: 400 }
          );
        }

        // Replace request with validated data
        const validatedRequest = new NextRequest(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(validation.data)
        });

        return handler(validatedRequest, user);
      }

      // 5. Call the handler with authenticated user
      return handler(request, user);
    }

    // No auth required, call handler directly
    return handler(request, null);

  } catch (error) {
    console.error('Security middleware error:', error);
    
    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'An error occurred processing your request' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper to add security headers to response
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Restrict browser features
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Add HSTS for HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  return response;
}

// Check if request is from allowed origin
export function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // Same-origin requests

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://courseflow.app',
    'https://www.courseflow.app',
    'http://localhost:3000' // Development only
  ].filter(Boolean);

  // Remove localhost in production
  if (process.env.NODE_ENV === 'production') {
    const prodOrigins = allowedOrigins.filter(o => o && !o.includes('localhost'));
    return prodOrigins.includes(origin);
  }

  return allowedOrigins.includes(origin);
}

// Sanitize error messages for production
export function sanitizeError(error: unknown): string {
  if (process.env.NODE_ENV !== 'production') {
    return error instanceof Error ? error.message : String(error);
  }

  // In production, log the actual error but return generic message
  console.error('API Error:', error);
  
  // Check for specific error types we want to expose
  if (error instanceof Error) {
    // Validation errors can be shown
    if (error.message.includes('Invalid') || error.message.includes('Required')) {
      return error.message;
    }
    
    // Rate limit errors
    if (error.message.includes('Too many')) {
      return error.message;
    }
  }

  // Default generic error
  return 'An error occurred processing your request';
}