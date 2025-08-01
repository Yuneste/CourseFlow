export interface TierLimits {
  storage: number; // MB
  filesPerMonth: number;
  aiSummariesPerMonth: number;
  maxCourses: number;
  studyGroups: number;
  maxAICostPerMonth: number; // EUR
}

export interface SubscriptionTier {
  name: string;
  price: number; // EUR, VAT included
  stripePriceId?: string;
  limits: TierLimits;
}

import { env } from '@/lib/env';

export const SUBSCRIPTION_TIERS: Record<'explorer' | 'scholar' | 'master', SubscriptionTier> = {
  explorer: {
    name: 'Explorer',
    price: 0,
    limits: {
      storage: 500, // MB
      filesPerMonth: 50,
      aiSummariesPerMonth: 10,
      maxCourses: 3,
      studyGroups: 1, // join only
      maxAICostPerMonth: 0.50 // EUR - loss leader strategy
    }
  },
  scholar: {
    name: 'Scholar', 
    price: 10.00, // EUR, VAT included
    stripePriceId: env.STRIPE_PRICE_SCHOLAR_MONTHLY_EUR || undefined,
    limits: {
      storage: 5120, // MB (5GB)
      filesPerMonth: 500,
      aiSummariesPerMonth: 100,
      maxCourses: -1, // unlimited
      studyGroups: 5,
      maxAICostPerMonth: 4.00 // EUR - 40% of revenue
    }
  },
  master: {
    name: 'Master',
    price: 25.00, // EUR, VAT included
    stripePriceId: env.STRIPE_PRICE_MASTER_MONTHLY_EUR || undefined,
    limits: {
      storage: 51200, // MB (50GB)
      filesPerMonth: -1, // unlimited
      aiSummariesPerMonth: 500,
      maxCourses: -1, // unlimited
      studyGroups: -1, // unlimited
      maxAICostPerMonth: 10.00 // EUR - 40% of revenue
    }
  }
};

// Helper function to get tier by name
export function getTierByName(tierName: 'explorer' | 'scholar' | 'master'): SubscriptionTier {
  return SUBSCRIPTION_TIERS[tierName];
}

// Helper function to check if a feature is within limits
export function isWithinLimit(
  tierName: 'explorer' | 'scholar' | 'master', 
  feature: keyof TierLimits, 
  currentUsage: number
): boolean {
  const tier = SUBSCRIPTION_TIERS[tierName];
  const limit = tier.limits[feature];
  
  // -1 means unlimited
  if (limit === -1) return true;
  
  return currentUsage < limit;
}

// Get display-friendly limit text
export function getLimitDisplay(limit: number): string {
  if (limit === -1) return 'Unlimited';
  if (limit === 0) return 'Not available';
  return limit.toString();
}