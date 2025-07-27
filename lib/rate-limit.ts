import { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function checkRateLimit(
  request: NextRequest,
  userId: string,
  limit: number = 10,
  windowMs: number = 60 * 1000 // 1 minute default
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const key = `${userId}:${request.nextUrl.pathname}`;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetTime < now) {
    // Create new entry
    entry = {
      count: 1,
      resetTime: now + windowMs
    };
    rateLimitStore.set(key, entry);
  } else {
    // Increment existing entry
    entry.count++;
  }
  
  const allowed = entry.count <= limit;
  const remaining = Math.max(0, limit - entry.count);
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime
  };
}

export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  resetTime: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetTime).toISOString(),
  };
}