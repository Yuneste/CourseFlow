import { NextRequest } from 'next/server'
import { env } from './env'

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: Date
}

// In-memory store for rate limiting (consider Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  Array.from(rateLimitStore.entries()).forEach(([key, value]) => {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  })
}, 60000) // Clean up every minute

export async function rateLimit(
  request: NextRequest,
  options?: {
    limit?: number
    windowMs?: number
    keyGenerator?: (req: NextRequest) => string
  }
): Promise<RateLimitResult> {
  const limit = options?.limit || env.rateLimitRequests
  const windowMs = options?.windowMs || env.rateLimitWindowMs
  
  // Generate a unique key for this client
  const key = options?.keyGenerator
    ? options.keyGenerator(request)
    : getDefaultKey(request)
  
  const now = Date.now()
  const resetTime = now + windowMs
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(key)
  
  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired one
    entry = { count: 1, resetTime }
    rateLimitStore.set(key, entry)
  } else {
    // Increment count
    entry.count++
  }
  
  const remaining = Math.max(0, limit - entry.count)
  const success = entry.count <= limit
  
  return {
    success,
    limit,
    remaining,
    reset: new Date(entry.resetTime),
  }
}

function getDefaultKey(request: NextRequest): string {
  // Try to get client IP
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  
  // Include user ID if authenticated
  const userId = request.headers.get('x-user-id') || 'anonymous'
  
  // Include API route
  const pathname = request.nextUrl.pathname
  
  return `${ip}:${userId}:${pathname}`
}

// Middleware helper to apply rate limiting
export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  options?: Parameters<typeof rateLimit>[1]
) {
  return async (request: NextRequest): Promise<Response> => {
    const result = await rateLimit(request, options)
    
    if (!result.success) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toISOString(),
          'Retry-After': Math.ceil((result.reset.getTime() - Date.now()) / 1000).toString(),
        },
      })
    }
    
    // Add rate limit headers to successful responses
    const response = await handler(request)
    response.headers.set('X-RateLimit-Limit', result.limit.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.reset.toISOString())
    
    return response
  }
}