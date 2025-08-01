import { createAdminClient } from '@/lib/supabase/admin';
import { SUBSCRIPTION_TIERS } from '@/lib/subscriptions/tiers';

export interface RevenueMetrics {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  arpu: number; // Average Revenue Per User
  churnRate: number;
  ltv: number; // Lifetime Value
  conversionRate: number;
  trialConversionRate: number;
}

export interface UpgradeOpportunity {
  userId: string;
  currentTier: string;
  suggestedTier: string;
  reason: string;
  potentialRevenue: number;
  score: number; // 0-100
}

export interface PricingOptimization {
  currentPrice: number;
  suggestedPrice: number;
  elasticity: number;
  projectedRevenueDelta: number;
}

export class RevenueOptimizationService {
  private static instance: RevenueOptimizationService;

  static getInstance(): RevenueOptimizationService {
    if (!this.instance) {
      this.instance = new RevenueOptimizationService();
    }
    return this.instance;
  }

  async calculateRevenueMetrics(): Promise<RevenueMetrics> {
    const supabase = createAdminClient();

    try {
      // Get all active subscriptions
      const { data: subscribers } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, created_at')
        .in('subscription_tier', ['scholar', 'master'])
        .eq('subscription_status', 'active');

      // Calculate MRR
      let mrr = 0;
      subscribers?.forEach(sub => {
        if (sub.subscription_tier === 'scholar') mrr += 10;
        else if (sub.subscription_tier === 'master') mrr += 25;
      });

      // Calculate ARR
      const arr = mrr * 12;

      // Calculate ARPU
      const totalUsers = subscribers?.length || 0;
      const arpu = totalUsers > 0 ? mrr / totalUsers : 0;

      // Calculate churn rate (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count: churned } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'canceled')
        .gte('updated_at', thirtyDaysAgo);

      const churnRate = totalUsers > 0 ? ((churned || 0) / totalUsers) * 100 : 0;

      // Calculate LTV (simplified: ARPU / churn rate)
      const monthlyChurnRate = churnRate / 100;
      const ltv = monthlyChurnRate > 0 ? arpu / monthlyChurnRate : arpu * 24; // Default 24 months

      // Calculate conversion rates
      const { count: totalTrials } = await supabase
        .from('usage_tracking')
        .select('*', { count: 'exact', head: true })
        .eq('metric_type', 'trial_started')
        .gte('created_at', thirtyDaysAgo);

      const { count: conversions } = await supabase
        .from('usage_tracking')
        .select('*', { count: 'exact', head: true })
        .eq('metric_type', 'trial_converted')
        .gte('created_at', thirtyDaysAgo);

      const trialConversionRate = totalTrials && totalTrials > 0 
        ? ((conversions || 0) / totalTrials) * 100 
        : 0;

      // Overall conversion rate (free to paid)
      const { count: totalFree } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_tier', 'explorer');

      const conversionRate = totalFree && totalFree > 0
        ? (totalUsers / (totalFree + totalUsers)) * 100
        : 0;

      return {
        mrr,
        arr,
        arpu,
        churnRate,
        ltv,
        conversionRate,
        trialConversionRate
      };

    } catch (error) {
      console.error('Failed to calculate revenue metrics:', error);
      return {
        mrr: 0,
        arr: 0,
        arpu: 0,
        churnRate: 0,
        ltv: 0,
        conversionRate: 0,
        trialConversionRate: 0
      };
    }
  }

  async identifyUpgradeOpportunities(): Promise<UpgradeOpportunity[]> {
    const supabase = createAdminClient();
    const opportunities: UpgradeOpportunity[] = [];

    try {
      // Get all active users with usage data
      const { data: users } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          subscription_tier,
          created_at
        `)
        .in('subscription_tier', ['explorer', 'scholar']);

      if (!users) return opportunities;

      // Analyze each user
      for (const user of users) {
        const score = await this.calculateUpgradeScore(user.id);
        
        if (score > 60) { // High likelihood to upgrade
          const suggestedTier = user.subscription_tier === 'explorer' ? 'scholar' : 'master';
          const potentialRevenue = suggestedTier === 'scholar' ? 10 : 25;
          
          opportunities.push({
            userId: user.id,
            currentTier: user.subscription_tier,
            suggestedTier,
            reason: this.getUpgradeReason(score, user.subscription_tier),
            potentialRevenue,
            score
          });
        }
      }

      // Sort by score descending
      return opportunities.sort((a, b) => b.score - a.score);

    } catch (error) {
      console.error('Failed to identify upgrade opportunities:', error);
      return opportunities;
    }
  }

  private async calculateUpgradeScore(userId: string): Promise<number> {
    const supabase = createAdminClient();
    let score = 0;

    try {
      // Check usage patterns
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // File uploads
      const { count: fileCount } = await supabase
        .from('files')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo);

      if ((fileCount || 0) > 20) score += 20;
      else if ((fileCount || 0) > 10) score += 10;

      // AI usage
      const { count: aiUsage } = await supabase
        .from('ai_usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo);

      if ((aiUsage || 0) > 50) score += 30;
      else if ((aiUsage || 0) > 20) score += 20;

      // Check if hitting limits
      const { data: limitHits } = await supabase
        .from('usage_tracking')
        .select('metric_type')
        .eq('user_id', userId)
        .in('metric_type', ['limit_reached', 'feature_blocked'])
        .gte('created_at', thirtyDaysAgo);

      if (limitHits && limitHits.length > 0) score += 25;

      // Account age (older accounts more likely to upgrade)
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', userId)
        .single();

      if (profile) {
        const accountAge = Date.now() - new Date(profile.created_at).getTime();
        const days = accountAge / (24 * 60 * 60 * 1000);
        
        if (days > 90) score += 15;
        else if (days > 30) score += 10;
        else if (days > 7) score += 5;
      }

    } catch (error) {
      console.error('Failed to calculate upgrade score:', error);
    }

    return Math.min(score, 100);
  }

  private getUpgradeReason(score: number, currentTier: string): string {
    if (score >= 80) {
      return 'Heavy usage patterns indicate need for premium features';
    } else if (score >= 70) {
      return 'Frequently hitting usage limits';
    } else if (score >= 60) {
      return 'Active user who would benefit from additional features';
    }
    return 'Potential upgrade candidate';
  }

  async optimizePricing(tier: 'scholar' | 'master'): Promise<PricingOptimization> {
    const currentPrice = tier === 'scholar' ? 10 : 25;
    
    // This is a simplified elasticity model
    // In production, use A/B testing and cohort analysis
    const elasticity = -1.2; // Price elasticity of demand
    
    // Calculate optimal price based on current conversion data
    const conversionData = await this.getConversionDataByPrice(tier);
    
    // Simple optimization: if conversion is high, test higher price
    let suggestedPrice = currentPrice;
    if (conversionData.conversionRate > 30) {
      suggestedPrice = currentPrice * 1.1; // 10% increase
    } else if (conversionData.conversionRate < 10) {
      suggestedPrice = currentPrice * 0.9; // 10% decrease
    }
    
    // Calculate projected revenue change
    const quantityChange = elasticity * ((suggestedPrice - currentPrice) / currentPrice);
    const projectedRevenueDelta = (suggestedPrice * (1 + quantityChange)) - currentPrice;
    
    return {
      currentPrice,
      suggestedPrice: Math.round(suggestedPrice * 100) / 100,
      elasticity,
      projectedRevenueDelta
    };
  }

  private async getConversionDataByPrice(tier: string): Promise<{ conversionRate: number }> {
    // Simplified - in production, track conversion by price point
    const supabase = createAdminClient();
    
    const { count: trials } = await supabase
      .from('usage_tracking')
      .select('*', { count: 'exact', head: true })
      .eq('metric_type', 'checkout_started')
      .eq('metadata->tier', tier);
    
    const { count: conversions } = await supabase
      .from('usage_tracking')
      .select('*', { count: 'exact', head: true })
      .eq('metric_type', 'checkout_completed')
      .eq('metadata->tier', tier);
    
    const conversionRate = trials && trials > 0 
      ? ((conversions || 0) / trials) * 100 
      : 15; // Default
    
    return { conversionRate };
  }

  async generateRevenueReport(): Promise<{
    metrics: RevenueMetrics;
    opportunities: UpgradeOpportunity[];
    projections: {
      nextMonthMRR: number;
      nextQuarterARR: number;
      growthRate: number;
    };
    recommendations: string[];
  }> {
    const [metrics, opportunities] = await Promise.all([
      this.calculateRevenueMetrics(),
      this.identifyUpgradeOpportunities()
    ]);

    // Calculate projections
    const avgGrowthRate = 0.05; // 5% monthly growth (adjust based on historical data)
    const nextMonthMRR = metrics.mrr * (1 + avgGrowthRate);
    const nextQuarterARR = metrics.mrr * (1 + avgGrowthRate) ** 3 * 12;

    // Generate recommendations
    const recommendations: string[] = [];

    if (metrics.churnRate > 5) {
      recommendations.push('High churn rate detected. Implement retention campaigns.');
    }

    if (metrics.trialConversionRate < 20) {
      recommendations.push('Low trial conversion. Improve onboarding and trial experience.');
    }

    if (opportunities.length > 10) {
      recommendations.push(`${opportunities.length} users ready for upgrade. Launch targeted campaigns.`);
    }

    if (metrics.arpu < 15) {
      recommendations.push('Low ARPU. Focus on moving users to higher tiers.');
    }

    // Add opportunity-based recommendations
    const totalPotentialRevenue = opportunities.reduce((sum, opp) => sum + opp.potentialRevenue, 0);
    if (totalPotentialRevenue > metrics.mrr * 0.1) {
      recommendations.push(`Potential ${totalPotentialRevenue}€ MRR increase from upgrades.`);
    }

    return {
      metrics,
      opportunities: opportunities.slice(0, 20), // Top 20 opportunities
      projections: {
        nextMonthMRR,
        nextQuarterARR,
        growthRate: avgGrowthRate * 100
      },
      recommendations
    };
  }

  async trackRevenueEvent(
    eventType: string,
    userId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    const supabase = createAdminClient();

    try {
      await supabase.from('usage_tracking').insert({
        user_id: userId,
        metric_type: `revenue_${eventType}`,
        metric_value: metadata.value || 1,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to track revenue event:', error);
    }
  }
}