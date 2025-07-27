# Security and Performance

## Security Requirements
**Frontend Security:**
- CSP Headers: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';`
- XSS Prevention: React's automatic escaping + input sanitization
- Secure Storage: Sensitive data only in httpOnly cookies

**Backend Security:**
- Input Validation: Zod schemas on all API inputs
- Rate Limiting: 100 requests per minute per IP
- CORS Policy: Allow only from known domains

**Authentication Security:**
- Token Storage: httpOnly cookies for refresh tokens
- Session Management: 30-day refresh token, 1-hour access token
- Password Policy: Minimum 8 characters, complexity requirements

## Performance Optimization
**Frontend Performance:**
- Bundle Size Target: <200KB initial JS
- Loading Strategy: Code splitting by route, lazy loading
- Caching Strategy: SWR for data fetching, 5-minute cache

**Backend Performance:**
- Response Time Target: <200ms p95
- Database Optimization: Proper indexes, connection pooling
- Caching Strategy: Vercel Edge Cache for static content
