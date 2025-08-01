import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { detectAbusePatterns, applyAbusePrevention } from '@/lib/security/abuse-prevention';

// High-risk endpoints that need abuse checking
const HIGH_RISK_ENDPOINTS = [
  '/api/files/upload',
  '/api/ai/generate',
  '/api/ai/summary',
  '/api/billing/create-checkout'
];

export async function abuseCheckMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  // Only check high-risk endpoints
  const path = request.nextUrl.pathname;
  if (!HIGH_RISK_ENDPOINTS.some(endpoint => path.startsWith(endpoint))) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null; // Let auth middleware handle this
    }

    // Check for existing blocks
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_status, rate_limit_until, feature_flags')
      .eq('id', user.id)
      .single();

    // Check if account is suspended
    if (profile?.account_status === 'suspended') {
      return NextResponse.json(
        { 
          error: 'Account suspended',
          message: 'Your account has been suspended due to policy violations. Please contact support.'
        },
        { status: 403 }
      );
    }

    // Check rate limiting
    if (profile?.rate_limit_until) {
      const limitExpiry = new Date(profile.rate_limit_until);
      if (limitExpiry > new Date()) {
        return NextResponse.json(
          { 
            error: 'Rate limited',
            message: 'You have been temporarily rate limited. Please try again later.',
            retryAfter: Math.ceil((limitExpiry.getTime() - Date.now()) / 1000)
          },
          { 
            status: 429,
            headers: {
              'Retry-After': Math.ceil((limitExpiry.getTime() - Date.now()) / 1000).toString()
            }
          }
        );
      }
    }

    // Check feature-specific blocks
    const featureFlags = profile?.feature_flags as any || {};
    
    if (path.includes('/ai/') && featureFlags.ai_blocked) {
      return NextResponse.json(
        { 
          error: 'Feature blocked',
          message: 'AI features have been temporarily disabled for your account.'
        },
        { status: 403 }
      );
    }

    if (path.includes('/files/upload') && featureFlags.uploads_blocked) {
      return NextResponse.json(
        { 
          error: 'Feature blocked',
          message: 'File uploads have been temporarily disabled for your account.'
        },
        { status: 403 }
      );
    }

    // Perform real-time abuse detection for critical endpoints
    if (path === '/api/billing/create-checkout' || path === '/api/ai/generate') {
      const abuseResult = await detectAbusePatterns(user.id);
      
      if (abuseResult.abusive) {
        // Apply appropriate action
        const criticalPattern = abuseResult.patterns.find(p => p.severity === 'critical');
        const action = criticalPattern?.action || 'block';
        
        await applyAbusePrevention(user.id, action as any);
        
        return NextResponse.json(
          { 
            error: 'Suspicious activity detected',
            message: 'Your request has been blocked due to suspicious activity. Please contact support if you believe this is an error.'
          },
          { status: 403 }
        );
      }
    }

    return null;
  } catch (error) {
    console.error('Abuse check middleware error:', error);
    // Don't block on errors - fail open
    return null;
  }
}