# Security Fixes Required

## Database Function Search Paths ✅
**Status**: Fixed via migration `20250131_fix_function_search_paths.sql`

All functions now have explicit search paths set to prevent potential SQL injection attacks.

## Auth Configuration Warnings ⚠️

### 1. OTP Expiry Too Long
**Current**: OTP expiry is set to more than 1 hour
**Recommended**: Set to less than 1 hour

**Fix in Supabase Dashboard**:
1. Go to Authentication → Settings → Email
2. Find "OTP Expiry Duration"
3. Set to 3600 seconds (1 hour) or less (recommended: 900 seconds = 15 minutes)

### 2. Leaked Password Protection Disabled
**Current**: Disabled
**Recommended**: Enable to prevent use of compromised passwords

**Fix in Supabase Dashboard**:
1. Go to Authentication → Settings → Security
2. Enable "Leaked Password Protection"
3. This will check passwords against HaveIBeenPwned.org database

## How to Apply Database Fixes

Run the following migration in Supabase SQL Editor:

```sql
-- Run the migration file content from:
-- supabase/migrations/20250131_fix_function_search_paths.sql
```

## Benefits
- ✅ Prevents SQL injection attacks via search_path manipulation
- ✅ Reduces OTP vulnerability window
- ✅ Prevents use of known compromised passwords
- ✅ Improves overall security posture

## Additional Recommendations

1. **Enable MFA**: Consider enabling Multi-Factor Authentication for added security
2. **Regular Security Audits**: Run Supabase linter regularly to catch new issues
3. **Monitor Auth Logs**: Check for suspicious authentication attempts
4. **Update Dependencies**: Keep all packages and Supabase CLI up to date