// Environment variable validation
// This ensures all required environment variables are present at build/runtime

const requiredEnvVars = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // App
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  
} as const

// Optional environment variables with defaults
const optionalEnvVars = {
  // Analytics
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID || '',
  
  // Feature flags
  NEXT_PUBLIC_ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA || 'true',
  NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS || 'false',
  
  // API Rate limiting
  RATE_LIMIT_REQUESTS: process.env.RATE_LIMIT_REQUESTS || '100',
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || '900000', // 15 minutes
  
  // Stripe Configuration (optional for build time)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // Stripe Price IDs (optional, can be set in dashboard)
  STRIPE_PRICE_SCHOLAR_MONTHLY_EUR: process.env.STRIPE_PRICE_SCHOLAR_MONTHLY_EUR || '',
  STRIPE_PRICE_MASTER_MONTHLY_EUR: process.env.STRIPE_PRICE_MASTER_MONTHLY_EUR || '',
  
  // OpenAI (optional)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  
  // Redis (optional)
  REDIS_URL: process.env.REDIS_URL || '',
  
  // Sentry (optional)
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  
  // Metrics (optional)
  METRICS_SECRET: process.env.METRICS_SECRET || '',
  
  // AWS (optional - for backups)
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_REGION: process.env.AWS_REGION || '',
  BACKUP_S3_BUCKET: process.env.BACKUP_S3_BUCKET || '',
} as const

// Validate required environment variables
function validateEnv() {
  const missingVars: string[] = []

  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key)
    }
  })

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars
        .map(v => `  - ${v}`)
        .join('\n')}\n\nPlease check your .env.local file.`
    )
  }
}

// Only validate in production or when explicitly requested
if (process.env.NODE_ENV === 'production' || process.env.VALIDATE_ENV === 'true') {
  validateEnv()
}

// Export validated environment variables with proper types
export const env = {
  ...requiredEnvVars,
  ...optionalEnvVars,
  
  // Helper properties
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // Feature flags as booleans
  enablePWA: optionalEnvVars.NEXT_PUBLIC_ENABLE_PWA === 'true',
  enableAnalytics: optionalEnvVars.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  
  // Rate limiting as numbers
  rateLimitRequests: parseInt(optionalEnvVars.RATE_LIMIT_REQUESTS, 10),
  rateLimitWindowMs: parseInt(optionalEnvVars.RATE_LIMIT_WINDOW_MS, 10),
} as const

// Type-safe environment variable access
export type Env = typeof env