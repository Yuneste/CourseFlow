// Rate limiting configuration for all API endpoints
// Uses sliding window algorithm to prevent abuse

export interface RateLimitConfig {
  requests: number;
  window: string; // Format: '5m', '1h', '24h'
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Account operations - very strict to prevent account takeover attempts
  '/api/account': { requests: 3, window: '15m' },
  '/api/account/delete': { requests: 1, window: '1h' },
  
  // Authentication - prevent brute force
  '/api/auth/login': { requests: 5, window: '15m' },
  '/api/auth/signup': { requests: 3, window: '1h' },
  '/api/auth/reset-password': { requests: 3, window: '1h' },
  
  // File operations - moderate limits
  '/api/files': { requests: 60, window: '5m' },
  '/api/files/[id]': { requests: 30, window: '5m' },
  '/api/files/upload': { requests: 10, window: '5m' },
  '/api/files/check-duplicate': { requests: 30, window: '5m' },
  '/api/files/[id]/download': { requests: 20, window: '5m' },
  
  // Course operations - lenient for normal usage
  '/api/courses': { requests: 60, window: '5m' },
  '/api/courses/[id]': { requests: 60, window: '5m' },
  '/api/courses/folders': { requests: 60, window: '5m' },
  '/api/courses/folders/[id]': { requests: 60, window: '5m' },
  
  // Billing operations - very strict
  '/api/billing/create-checkout': { requests: 3, window: '15m' },
  '/api/billing/portal': { requests: 5, window: '1h' },
  '/api/billing/webhook': { requests: 100, window: '1m' }, // Higher for Stripe
  
  // Admin/Debug endpoints - extremely strict
  '/api/metrics': { requests: 10, window: '1h' },
  '/api/fix-subscription': { requests: 1, window: '24h' },
  '/api/test-subscription': { requests: 5, window: '1h' },
  
  // Health checks - allow monitoring services
  '/api/health': { requests: 60, window: '1m' },
  '/api/ready': { requests: 60, window: '1m' },
};

// Helper to get rate limit for a path
export function getRateLimitForPath(path: string): RateLimitConfig | undefined {
  // Direct match
  if (RATE_LIMITS[path]) {
    return RATE_LIMITS[path];
  }
  
  // Pattern match for dynamic routes
  for (const [pattern, config] of Object.entries(RATE_LIMITS)) {
    if (pattern.includes('[id]')) {
      const regex = new RegExp(pattern.replace('[id]', '[^/]+'));
      if (regex.test(path)) {
        return config;
      }
    }
  }
  
  // Default rate limit for unspecified endpoints
  return { requests: 60, window: '5m' };
}

// Convert window string to milliseconds
export function parseWindow(window: string): number {
  const match = window.match(/^(\d+)([mhd])$/);
  if (!match) {
    throw new Error(`Invalid window format: ${window}`);
  }
  
  const [, num, unit] = match;
  const multipliers = {
    'm': 60 * 1000,        // minutes
    'h': 60 * 60 * 1000,   // hours
    'd': 24 * 60 * 60 * 1000 // days
  };
  
  return parseInt(num) * multipliers[unit as keyof typeof multipliers];
}