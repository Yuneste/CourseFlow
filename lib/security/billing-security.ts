import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export interface SecurityCheck {
  passed: boolean;
  reason?: string;
  statusCode?: number;
}

// Security headers required for billing endpoints
export const REQUIRED_SECURITY_HEADERS = {
  'content-type': 'application/json',
  'x-requested-with': 'XMLHttpRequest' // CSRF protection
};

// Suspicious patterns in user data
const SUSPICIOUS_PATTERNS = [
  /test|demo|fake|dummy/i,
  /\d{16}/, // Credit card numbers in names/emails
  /[<>\"']/  // XSS attempts
];

// Check for suspicious user activity
export async function checkUserSecurity(userId: string): Promise<SecurityCheck> {
  const supabase = await createClient();
  
  // Get user profile and recent activity
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return {
      passed: false,
      reason: 'User profile not found',
      statusCode: 404
    };
  }

  // Check for suspicious email patterns
  if (SUSPICIOUS_PATTERNS.some(pattern => pattern.test(profile.email))) {
    return {
      passed: false,
      reason: 'Suspicious user data detected',
      statusCode: 403
    };
  }

  // Check for recent failed payment attempts
  const { data: recentFailures, error: failureError } = await supabase
    .from('usage_tracking')
    .select('created_at')
    .eq('user_id', userId)
    .eq('metric_type', 'payment_failed')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  if (!failureError && recentFailures && recentFailures.length > 3) {
    return {
      passed: false,
      reason: 'Too many recent payment failures',
      statusCode: 429
    };
  }

  // Check account age
  const accountAge = Date.now() - new Date(profile.created_at).getTime();
  const MIN_ACCOUNT_AGE = 5 * 60 * 1000; // 5 minutes
  
  if (accountAge < MIN_ACCOUNT_AGE) {
    return {
      passed: false,
      reason: 'Account too new for payment processing',
      statusCode: 403
    };
  }

  return { passed: true };
}

// Verify request origin and headers
export function verifyRequestSecurity(request: NextRequest): SecurityCheck {
  const requestHeaders = headers();
  
  // Check origin
  const origin = requestHeaders.get('origin');
  const referer = requestHeaders.get('referer');
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000'
  ].filter(Boolean);

  if (origin && !allowedOrigins.includes(origin)) {
    return {
      passed: false,
      reason: 'Invalid request origin',
      statusCode: 403
    };
  }

  // Verify CSRF token (if implemented)
  const csrfToken = requestHeaders.get('x-csrf-token');
  // In production, verify this against session-stored token

  // Check for automation/bot patterns
  const userAgent = requestHeaders.get('user-agent') || '';
  const botPatterns = [
    /bot|crawler|spider|scraper/i,
    /headless/i,
    /phantom|selenium/i
  ];

  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    return {
      passed: false,
      reason: 'Automated requests not allowed',
      statusCode: 403
    };
  }

  return { passed: true };
}

// IP-based security checks
export function checkIPSecurity(request: NextRequest): SecurityCheck {
  const forwardedFor = headers().get('x-forwarded-for');
  const realIP = headers().get('x-real-ip');
  const clientIP = forwardedFor?.split(',')[0] || realIP || 'unknown';

  // Check against known VPN/proxy IPs (in production, use a service like IPQualityScore)
  const suspiciousIPPatterns = [
    /^10\./, // Private network
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private network
    /^192\.168\./, // Private network
    /^127\./ // Localhost
  ];

  // Allow private IPs in development
  if (process.env.NODE_ENV === 'production') {
    if (suspiciousIPPatterns.some(pattern => pattern.test(clientIP))) {
      return {
        passed: false,
        reason: 'Suspicious IP address',
        statusCode: 403
      };
    }
  }

  return { passed: true };
}

// Comprehensive billing security check
export async function performBillingSecurityCheck(
  request: NextRequest,
  userId: string
): Promise<SecurityCheck> {
  // Check request security
  const requestCheck = verifyRequestSecurity(request);
  if (!requestCheck.passed) return requestCheck;

  // Check IP security
  const ipCheck = checkIPSecurity(request);
  if (!ipCheck.passed) return ipCheck;

  // Check user security
  const userCheck = await checkUserSecurity(userId);
  if (!userCheck.passed) return userCheck;

  return { passed: true };
}

// Log security events
export async function logSecurityEvent(
  userId: string,
  eventType: string,
  metadata: Record<string, any>
) {
  const supabase = await createClient();
  
  try {
    await supabase.from('usage_tracking').insert({
      user_id: userId,
      metric_type: `security_${eventType}`,
      metric_value: 1,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        ip: headers().get('x-forwarded-for') || 'unknown'
      }
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}