import Stripe from 'stripe';

// Initialize Stripe with proper configuration
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil',
    maxNetworkRetries: 2,
    timeout: 10000, // 10 second timeout
  });
}

// Export type for use in other files
export type StripeClient = ReturnType<typeof getStripe>;