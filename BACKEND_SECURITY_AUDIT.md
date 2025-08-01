# CourseFlow Backend Security Audit Report

## Executive Summary
This comprehensive security audit covers authentication, authorization, data validation, API security, and common vulnerabilities in your CourseFlow application.

## 🚨 Critical Issues Requiring Immediate Action

### 1. Remove Debug/Test Endpoints from Production
**Files to remove or secure:**
- `/app/api/fix-subscription/route.ts` - Manual subscription manipulation
- `/app/api/test-subscription/route.ts` - Exposes sensitive user data

**Action Required:**
```typescript
// Add to these files before the handler:
if (process.env.NODE_ENV === 'production') {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

### 2. Secure the Metrics Endpoint
**File:** `/app/api/metrics/route.ts`
**Issue:** Any authenticated user can view system metrics

**Fix:**
```typescript
// Add admin check after authentication
const { data: profile } = await supabase
  .from('profiles')
  .select('email')
  .eq('id', user.id)
  .single();

// Define admin emails in environment variable
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];
if (!ADMIN_EMAILS.includes(profile.email)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

### 3. Add Input Validation to File Updates
**File:** `/app/api/files/[id]/route.ts`
**Issue:** PATCH endpoint accepts any JSON without validation

**Fix:**
```typescript
// Add validation schema
const updateSchema = z.object({
  display_name: z.string().min(1).max(255).optional(),
  ai_summary: z.string().max(5000).optional(),
  ai_category: z.enum(['lecture', 'assignment', 'notes', 'exam', 'other']).optional(),
  // Only allow specific fields
});

// In PATCH handler:
const validation = updateSchema.safeParse(await request.json());
if (!validation.success) {
  return NextResponse.json({ 
    error: 'Invalid input', 
    details: validation.error.flatten() 
  }, { status: 400 });
}
```

## 🛡️ Security Improvements Needed

### 4. Implement Comprehensive Rate Limiting

Create a rate limiting configuration file:

```typescript
// lib/security/rate-limits.ts
export const RATE_LIMITS = {
  // Account operations - very strict
  '/api/account': { requests: 3, window: '15m' },
  
  // File operations - moderate
  '/api/files/[id]': { requests: 30, window: '5m' },
  '/api/files/upload': { requests: 10, window: '5m' },
  
  // Course operations - lenient
  '/api/courses': { requests: 60, window: '5m' },
  '/api/courses/folders': { requests: 60, window: '5m' },
  
  // Billing - strict
  '/api/billing/create-checkout': { requests: 3, window: '15m' },
  '/api/billing/portal': { requests: 5, window: '1h' },
};
```

Apply to all endpoints:
```typescript
// In each route handler:
import { rateLimiter } from '@/lib/security/rate-limiter';

const limit = await rateLimiter(request, RATE_LIMITS['/api/your-endpoint']);
if (!limit.success) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429, headers: limit.headers }
  );
}
```

### 5. Add Security Headers Middleware

Create middleware for consistent security headers:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      'https://courseflow.app',
      'https://www.courseflow.app'
    ].filter(Boolean);
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

### 6. Implement Transaction Safety for Batch Operations

**File:** `/app/api/courses/folders/route.ts`

```typescript
// Wrap batch updates in transaction
const { error } = await supabase.rpc('batch_update_folders', {
  updates: folders.map(f => ({
    folder_id: f.id,
    new_order: f.display_order
  }))
});

// Create the RPC function in Supabase:
CREATE OR REPLACE FUNCTION batch_update_folders(updates jsonb[])
RETURNS void AS $$
BEGIN
  FOR i IN 1..array_length(updates, 1) LOOP
    UPDATE course_folders 
    SET display_order = (updates[i]->>'new_order')::int
    WHERE id = (updates[i]->>'folder_id')::uuid
    AND course_id IN (
      SELECT id FROM courses WHERE user_id = auth.uid()
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 7. Environment Variable Security

Create an environment validation file:

```typescript
// lib/env-validation.ts
import { z } from 'zod';

const envSchema = z.object({
  // Required for basic operation
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  // Required for features
  OPENAI_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Security
  ADMIN_EMAILS: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);
```

### 8. Implement Proper Error Handling

Create a centralized error handler:

```typescript
// lib/api/error-handler.ts
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
  
  // Development: show more details
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Unknown error' },
    { status: 500 }
  );
}
```

## ✅ Security Strengths Already in Place

1. **Supabase RLS**: Row Level Security properly configured on all tables
2. **Authentication**: Consistent auth checks across all protected endpoints
3. **File Upload Security**: Comprehensive validation (type, size, virus scanning ready)
4. **SQL Injection Protection**: Using Supabase ORM prevents SQL injection
5. **No Direct DB Access**: All queries go through Supabase client with built-in security

## 📋 Security Checklist for New Features

When adding new API endpoints, always:

- [ ] Add authentication check
- [ ] Validate all inputs with Zod schemas
- [ ] Add rate limiting
- [ ] Check user owns the resource they're accessing
- [ ] Use transactions for multi-step operations
- [ ] Add proper error handling
- [ ] Log security events (failed auth, rate limits hit)
- [ ] Test with invalid/malicious inputs

## 🔐 Additional Security Recommendations

### 1. Add Request Logging
```typescript
// Log all API requests for security monitoring
const logRequest = async (req: NextRequest, res: NextResponse) => {
  await supabase.from('api_logs').insert({
    path: req.nextUrl.pathname,
    method: req.method,
    user_id: user?.id,
    status: res.status,
    ip: req.headers.get('x-forwarded-for'),
    timestamp: new Date().toISOString()
  });
};
```

### 2. Implement CSRF Protection
Since you're using session-based auth, add CSRF tokens:
```typescript
// Generate CSRF token on session creation
const csrfToken = crypto.randomBytes(32).toString('hex');
// Store in session and validate on state-changing requests
```

### 3. Add Security Monitoring
- Set up alerts for:
  - Multiple failed login attempts
  - Unusual file upload patterns
  - Rate limit violations
  - Access to admin endpoints

### 4. Regular Security Updates
- Keep all dependencies updated
- Run `npm audit` regularly
- Use Dependabot or similar for automated updates

## 🚀 Implementation Priority

1. **TODAY**: Remove/secure debug endpoints
2. **THIS WEEK**: 
   - Add input validation to all PATCH/POST endpoints
   - Implement rate limiting on all routes
   - Secure metrics endpoint
3. **THIS MONTH**:
   - Add transaction safety for batch operations
   - Implement comprehensive logging
   - Set up security monitoring

## Summary

Your application has a solid security foundation with Supabase Auth and RLS. The main vulnerabilities are:
- Debug endpoints exposed in production
- Missing input validation in some endpoints
- Incomplete rate limiting coverage
- Metrics endpoint accessible to all users

Addressing these issues will significantly improve your security posture. The good news is that you're already protected against major vulnerabilities like SQL injection and have proper authentication in place!