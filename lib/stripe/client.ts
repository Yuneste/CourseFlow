import Stripe from 'stripe';
import { env } from '@/lib/env';

// Initialize Stripe with proper configuration
export function getStripe() {
  const stripeKey = env.STRIPE_SECRET_KEY;
  
  if (!stripeKey) {
    // In development/build time, return a dummy client
    if (env.isDevelopment || env.isTest) {
      console.warn('STRIPE_SECRET_KEY is not configured');
    }
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  return new Stripe(stripeKey, {
    apiVersion: '2025-07-30.basil',
    maxNetworkRetries: 2,
    timeout: 10000, // 10 second timeout
  });
}

// Export type for use in other files
export type StripeClient = ReturnType<typeof getStripe>;