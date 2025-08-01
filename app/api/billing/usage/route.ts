import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UsageTrackingService } from '@/lib/services/usage-tracking.service';
import { SUBSCRIPTION_TIERS } from '@/lib/subscriptions/tiers';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const userTier = (profile?.subscription_tier || 'explorer') as 'explorer' | 'scholar' | 'master';

    // Get current usage
    const usage = await UsageTrackingService.getUserUsage(user.id);
    const tierLimits = SUBSCRIPTION_TIERS[userTier].limits;

    // Calculate usage percentages
    const usageWithPercentages = {
      // Remove filesUploaded - we only track storage now
      storage: {
        current: usage.storageUsed,
        limit: tierLimits.storage,
        percentage: UsageTrackingService.getUsagePercentage(
          usage.storageUsed, 
          tierLimits.storage
        ),
        unit: 'MB'
      },
      aiSummaries: {
        current: usage.aiSummariesUsed,
        limit: tierLimits.aiSummariesPerMonth,
        percentage: UsageTrackingService.getUsagePercentage(
          usage.aiSummariesUsed, 
          tierLimits.aiSummariesPerMonth
        )
      },
      aiSpend: {
        current: usage.aiSpendThisMonth,
        limit: tierLimits.maxAICostPerMonth,
        percentage: UsageTrackingService.getUsagePercentage(
          usage.aiSpendThisMonth, 
          tierLimits.maxAICostPerMonth
        ),
        unit: '€'
      }
    };

    // Check for abuse patterns
    const abuseCheck = await UsageTrackingService.checkForAbusePatterns(user.id);

    return NextResponse.json({
      tier: userTier,
      usage: usageWithPercentages,
      warnings: abuseCheck.suspicious ? abuseCheck.reasons : []
    });
  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}