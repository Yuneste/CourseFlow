import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RevenueOptimizationService } from '@/lib/services/revenue-optimization.service';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Return default pricing for anonymous users
      return NextResponse.json({
        offers: getDefaultOffers()
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, created_at, country')
      .eq('id', user.id)
      .single();

    const currentTier = profile?.subscription_tier || 'explorer';
    
    // Calculate personalized offers
    const revenueService = RevenueOptimizationService.getInstance();
    const upgradeOpportunities = await revenueService.identifyUpgradeOpportunities();
    const userOpportunity = upgradeOpportunities.find(opp => opp.userId === user.id);

    const offers = [];

    // Always show free tier
    offers.push({
      tier: 'explorer',
      basePrice: 0,
      features: [
        '5 courses',
        '10 files per course',
        '100MB storage',
        '5 AI summaries per month'
      ]
    });

    // Scholar tier with potential discount
    const scholarOffer: any = {
      tier: 'scholar',
      basePrice: 10,
      features: [
        'Unlimited courses',
        'Unlimited files',
        '10GB storage',
        '50 AI summaries per month',
        'Advanced analytics',
        'Priority email support'
      ]
    };

    // Apply personalized discount if user is a good upgrade candidate
    if (currentTier === 'explorer' && userOpportunity && userOpportunity.score >= 70) {
      scholarOffer.discountedPrice = 8;
      scholarOffer.discountPercentage = 20;
      scholarOffer.offerType = 'upgrade';
      scholarOffer.expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours
      scholarOffer.reason = 'Special offer based on your usage';
    }

    offers.push(scholarOffer);

    // Master tier
    const masterOffer: any = {
      tier: 'master',
      basePrice: 25,
      features: [
        'Everything in Scholar',
        '100GB storage',
        'Unlimited AI features',
        'API access',
        'Priority support',
        'Custom integrations',
        'Early access to features'
      ]
    };

    // Discount for Scholar users upgrading to Master
    if (currentTier === 'scholar' && userOpportunity && userOpportunity.score >= 60) {
      masterOffer.discountedPrice = 20;
      masterOffer.discountPercentage = 20;
      masterOffer.offerType = 'upgrade';
      masterOffer.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
    }

    offers.push(masterOffer);

    // Track pricing view
    await revenueService.trackRevenueEvent('pricing_viewed', user.id, {
      currentTier,
      hasPersonalizedOffer: offers.some(o => o.discountedPrice),
      upgradeScore: userOpportunity?.score || 0
    });

    return NextResponse.json({
      offers,
      personalized: true,
      currentTier
    });

  } catch (error) {
    console.error('Failed to get personalized pricing:', error);
    return NextResponse.json({
      offers: getDefaultOffers(),
      personalized: false
    });
  }
}

function getDefaultOffers() {
  return [
    {
      tier: 'explorer',
      basePrice: 0,
      features: [
        '5 courses',
        '10 files per course',
        '100MB storage',
        '5 AI summaries per month'
      ]
    },
    {
      tier: 'scholar',
      basePrice: 10,
      features: [
        'Unlimited courses',
        'Unlimited files',
        '10GB storage',
        '50 AI summaries per month',
        'Advanced analytics'
      ]
    },
    {
      tier: 'master',
      basePrice: 25,
      features: [
        'Everything in Scholar',
        '100GB storage',
        'Unlimited AI features',
        'Priority support',
        'Early access to features'
      ]
    }
  ];
}