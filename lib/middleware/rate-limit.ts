import { NextRequest, NextResponse } from 'next/server';
import { BILLING_RATE_LIMITS } from '@/lib/security/billing-limits';

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((value, key) => {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  });
}, 60000); // Clean every minute

export function rateLimitMiddleware(pathname: string) {
  return async (req: NextRequest) => {
    const limit = BILLING_RATE_LIMITS[pathname as keyof typeof BILLING_RATE_LIMITS];
    if (!limit) {
      return NextResponse.next();
    }

    // Get client IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                req.headers.get('x-real-ip') || 
                'unknown';
    
    const key = `${pathname}:${ip}`;
    const now = Date.now();
    
    const current = rateLimitStore.get(key);
    
    if (!current || current.resetTime < now) {
      // Start a new window
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + limit.window
      });
      return NextResponse.next();
    }
    
    if (current.count >= limit.limit) {
      return NextResponse.json(
        { error: limit.message },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limit.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(current.resetTime),
            'Retry-After': String(Math.ceil((current.resetTime - now) / 1000))
          }
        }
      );
    }
    
    // Increment counter
    current.count++;
    rateLimitStore.set(key, current);
    
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(limit.limit));
    response.headers.set('X-RateLimit-Remaining', String(limit.limit - current.count));
    response.headers.set('X-RateLimit-Reset', String(current.resetTime));
    
    return response;
  };
}

// Helper to apply rate limiting to an API route
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  pathname: string
) {
  return async (req: NextRequest) => {
    const rateLimitResponse = await rateLimitMiddleware(pathname)(req);
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }
    return handler(req);
  };
}