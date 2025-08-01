import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitStore>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: NextRequest) => string;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10
};

// Billing-specific rate limits
export const BILLING_RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/billing/create-checkout': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5 // Max 5 checkout attempts per hour
  },
  '/api/billing/verify-student': {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 3 // Max 3 verification attempts per day
  },
  '/api/billing/usage': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30 // Higher limit for usage checks
  },
  '/api/webhooks/stripe': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100 // Webhook endpoints need higher limits
  }
};

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const limit = rateLimitStore.get(key);

  // Initialize or reset if window expired
  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs
    };
  }

  // Check if limit exceeded
  if (limit.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: limit.resetTime
    };
  }

  // Increment counter
  limit.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - limit.count,
    resetTime: limit.resetTime
  };
}

export async function billingRateLimitMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  // Get the path
  const path = request.nextUrl.pathname;
  
  // Skip non-billing endpoints
  if (!path.startsWith('/api/billing') && !path.startsWith('/api/webhooks')) {
    return null;
  }

  // Get rate limit config for this endpoint
  const config = BILLING_RATE_LIMITS[path] || DEFAULT_CONFIG;

  // Generate rate limit key
  const ip = headers().get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const userId = request.headers.get('x-user-id') || 'anonymous';
  const key = `${path}:${ip}:${userId}`;

  // Check rate limit
  const { allowed, remaining, resetTime } = checkRateLimit(key, config);

  if (!allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
        }
      }
    );
  }

  // Add rate limit headers to response
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());

  return null;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((limit, key) => {
    if (now > limit.resetTime + 60000) { // 1 minute grace period
      rateLimitStore.delete(key);
    }
  });
}, 5 * 60 * 1000); // Run every 5 minutes