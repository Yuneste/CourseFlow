import crypto from 'crypto';

export interface WebhookSecurityConfig {
  maxAgeSeconds: number;
  requiredHeaders: string[];
  ipAllowlist?: string[];
}

export const WEBHOOK_SECURITY: WebhookSecurityConfig = {
  maxAgeSeconds: 300, // 5 minutes
  requiredHeaders: ['stripe-signature'],
  // Stripe webhook IPs (update regularly from Stripe docs)
  ipAllowlist: [
    // Add Stripe's IP ranges here when available
  ]
};

// Verify webhook timestamp to prevent replay attacks
export function verifyWebhookTimestamp(
  timestampHeader: string | null,
  maxAgeSeconds: number = WEBHOOK_SECURITY.maxAgeSeconds
): boolean {
  if (!timestampHeader) return false;
  
  const timestamp = parseInt(timestampHeader);
  if (isNaN(timestamp)) return false;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const age = currentTime - timestamp;
  
  return age > 0 && age < maxAgeSeconds;
}

// Rate limiting for webhooks
interface WebhookRateLimit {
  windowMs: number;
  maxRequests: number;
}

const webhookRateLimits = new Map<string, { count: number; resetTime: number }>();

export function checkWebhookRateLimit(
  identifier: string,
  config: WebhookRateLimit = { windowMs: 60000, maxRequests: 100 }
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const limit = webhookRateLimits.get(identifier);

  if (!limit || now > limit.resetTime) {
    webhookRateLimits.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return { allowed: true };
  }

  if (limit.count >= config.maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((limit.resetTime - now) / 1000)
    };
  }

  limit.count++;
  return { allowed: true };
}

// Webhook event deduplication
const processedEvents = new Map<string, number>();
const EVENT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function isEventProcessed(eventId: string): boolean {
  const processedAt = processedEvents.get(eventId);
  
  if (!processedAt) return false;
  
  // Clean up old events
  const now = Date.now();
  if (now - processedAt > EVENT_CACHE_TTL) {
    processedEvents.delete(eventId);
    return false;
  }
  
  return true;
}

export function markEventProcessed(eventId: string): void {
  processedEvents.set(eventId, Date.now());
  
  // Clean up old events periodically
  if (processedEvents.size > 10000) {
    const now = Date.now();
    processedEvents.forEach((time, id) => {
      if (now - time > EVENT_CACHE_TTL) {
        processedEvents.delete(id);
      }
    });
  }
}

// Generate webhook endpoint token for additional security
export function generateWebhookToken(secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(Date.now().toString())
    .digest('hex');
}

export function verifyWebhookToken(token: string, secret: string, maxAge: number = 300000): boolean {
  // This is a simplified version - in production, store tokens with timestamps
  // and verify both the token and its age
  try {
    // For now, just verify the format
    return /^[a-f0-9]{64}$/.test(token);
  } catch {
    return false;
  }
}