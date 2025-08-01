export const BILLING_RATE_LIMITS = {
  '/api/billing/create-checkout': {
    limit: 3,
    window: 15 * 60 * 1000, // 15 minutes in ms
    message: 'Too many checkout attempts. Please try again later.'
  },
  '/api/billing/portal': {
    limit: 5,
    window: 60 * 60 * 1000, // 1 hour in ms
    message: 'Too many portal access attempts. Please try again later.'
  },
  '/api/billing/webhook': {
    limit: 100,
    window: 60 * 1000, // 1 minute in ms
    message: 'Webhook rate limit exceeded.'
  },
  '/api/billing/usage': {
    limit: 60,
    window: 60 * 60 * 1000, // 1 hour in ms
    message: 'Too many usage check requests. Please try again later.'
  }
};

// Stripe webhook IPs for security
export const STRIPE_WEBHOOK_IPS = [
  '3.18.12.63', '3.130.192.231', '13.235.14.237', '13.235.122.149',
  '18.211.135.69', '35.154.171.200', '52.15.183.38', '54.88.130.119',
  '54.88.130.237', '54.187.174.169', '54.187.205.235', '54.187.216.72'
];

// Disposable email domains to block for paid subscriptions
export const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
  'throwaway.email', 'yopmail.com', 'maildrop.cc', 'dispostable.com',
  'temp-mail.org', 'trashmail.com', 'fakeinbox.com', 'sharklasers.com'
];

// Security thresholds
export const SECURITY_THRESHOLDS = {
  maxCardsPerDay: 3,
  maxAccountsPerIP: 3,
  maxFilesPerHour: 50,
  suspiciousUsageMultiplier: 10, // 10x normal usage triggers alert
  dailySpendAlertThreshold: 2, // EUR
  monthlyCostCircuitBreaker: 1000 // EUR
};

// Check if email is disposable
export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  return DISPOSABLE_EMAIL_DOMAINS.some(disposable => 
    domain.includes(disposable)
  );
}

// Check if IP is from Stripe webhook
export function isStripeWebhookIP(ip: string): boolean {
  return STRIPE_WEBHOOK_IPS.includes(ip);
}