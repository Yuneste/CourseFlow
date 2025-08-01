import { createClient } from '@/lib/supabase/server';
import { SUBSCRIPTION_TIERS, isWithinLimit } from '@/lib/subscriptions/tiers';

export interface UsageMetrics {
  filesUploaded: number;
  aiSummariesUsed: number;
  storageUsed: number; // MB
  aiSpendThisMonth: number; // EUR
}

// Simple in-memory cache for user tier (with 5 minute TTL)
const tierCache = new Map<string, { tier: string; timestamp: number }>();
const TIER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class UsageTrackingService {
  /**
   * Get current usage metrics for a user
   * OPTIMIZED: Combined queries where possible and added caching
   */
  static async getUserUsage(userId: string): Promise<UsageMetrics> {
    const supabase = await createClient();
    
    // Get current month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // OPTIMIZATION: Run all queries in parallel instead of sequentially
    const [filesResult, aiUsageResult, storageResult] = await Promise.all([
      // Get file upload count for this month
      supabase
        .from('files')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString()),
      
      // Get AI usage data for this month
      supabase
        .from('ai_usage_logs')
        .select('cost')
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString()),
      
      // OPTIMIZATION: Get aggregated storage in a single query
      supabase
        .from('files')
        .select('file_size')
        .eq('user_id', userId)
        .then(result => ({
          data: result.data,
          totalSize: result.data?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0
        }))
    ]);

    const filesUploaded = filesResult.count || 0;
    const aiUsageData = aiUsageResult.data || [];
    const aiSummariesUsed = aiUsageData.length;
    const aiSpendThisMonth = aiUsageData.reduce((sum, log) => sum + (log.cost || 0), 0);
    const storageUsedMB = Math.round(storageResult.totalSize / (1024 * 1024));

    return {
      filesUploaded,
      aiSummariesUsed,
      storageUsed: storageUsedMB,
      aiSpendThisMonth
    };
  }

  /**
   * Get user tier with caching to reduce database hits
   */
  static async getUserTier(userId: string): Promise<string> {
    // Check cache first
    const cached = tierCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < TIER_CACHE_TTL) {
      return cached.tier;
    }

    // Fetch from database
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    const tier = profile?.subscription_tier || 'explorer';
    
    // Update cache
    tierCache.set(userId, { tier, timestamp: Date.now() });
    
    return tier;
  }

  /**
   * Check if user can perform an action based on their tier limits
   */
  static async canPerformAction(
    userId: string,
    userTier: 'explorer' | 'scholar' | 'master',
    action: keyof typeof SUBSCRIPTION_TIERS.explorer.limits
  ): Promise<{ allowed: boolean; reason?: string; currentUsage?: number; limit?: number }> {
    const usage = await this.getUserUsage(userId);
    const tier = SUBSCRIPTION_TIERS[userTier];
    const limit = tier.limits[action];

    let currentUsage: number;
    switch (action) {
      case 'filesPerMonth':
        currentUsage = usage.filesUploaded;
        break;
      case 'aiSummariesPerMonth':
        currentUsage = usage.aiSummariesUsed;
        break;
      case 'storage':
        currentUsage = usage.storageUsed;
        break;
      case 'maxAICostPerMonth':
        currentUsage = usage.aiSpendThisMonth;
        break;
      default:
        currentUsage = 0;
    }

    const allowed = isWithinLimit(userTier, action, currentUsage);

    if (!allowed) {
      return {
        allowed: false,
        reason: `You've reached your ${tier.name} plan limit for this feature`,
        currentUsage,
        limit
      };
    }

    return { allowed: true, currentUsage, limit };
  }

  /**
   * Track AI usage and cost
   */
  static async trackAIUsage(
    userId: string,
    feature: string,
    tokensUsed: number,
    cost: number,
    model: string
  ): Promise<void> {
    const supabase = await createClient();

    await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      feature,
      tokens_used: tokensUsed,
      cost,
      model,
      created_at: new Date().toISOString()
    });
  }

  /**
   * Get usage percentage for display
   */
  static getUsagePercentage(current: number, limit: number): number {
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 100; // Not available
    return Math.round((current / limit) * 100);
  }

  /**
   * Check for suspicious usage patterns
   * OPTIMIZED: Combined queries and better pattern detection
   */
  static async checkForAbusePatterns(userId: string): Promise<{
    suspicious: boolean;
    reasons: string[];
  }> {
    const supabase = await createClient();
    const reasons: string[] = [];

    // OPTIMIZATION: Run abuse checks in parallel
    const [recentUploadsResult, duplicateCheckResult, aiSpendResult] = await Promise.all([
      // Check for rapid file uploads (>50 in 1 hour)
      supabase
        .from('files')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()),
      
      // Check for duplicate files (same hash uploaded multiple times)
      supabase
        .from('files')
        .select('file_hash')
        .eq('user_id', userId),
      
      // Check for excessive AI spend in last 24 hours
      supabase
        .from('ai_usage_logs')
        .select('cost')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ]);

    // Analyze results
    const recentUploads = recentUploadsResult.count || 0;
    if (recentUploads > 50) {
      reasons.push(`Excessive file uploads detected: ${recentUploads} files in the last hour`);
    }

    // Check for duplicate files
    if (duplicateCheckResult.data) {
      const hashCounts = new Map<string, number>();
      duplicateCheckResult.data.forEach(file => {
        const count = hashCounts.get(file.file_hash) || 0;
        hashCounts.set(file.file_hash, count + 1);
      });
      
      const duplicates = Array.from(hashCounts.entries()).filter(([_, count]) => count > 5);
      if (duplicates.length > 0) {
        reasons.push(`Duplicate files detected: ${duplicates.length} files uploaded more than 5 times`);
      }
    }

    // Check AI spend
    if (aiSpendResult.data) {
      const dailySpend = aiSpendResult.data.reduce((sum, log) => sum + (log.cost || 0), 0);
      if (dailySpend > 2) { // €2 daily limit as per story
        reasons.push(`Excessive AI usage: €${dailySpend.toFixed(2)} spent in the last 24 hours`);
      }
    }

    return {
      suspicious: reasons.length > 0,
      reasons
    };
  }

  /**
   * Clear cache for a specific user (useful after subscription changes)
   */
  static clearUserCache(userId: string): void {
    tierCache.delete(userId);
  }

  /**
   * Clear all expired cache entries (runs periodically)
   */
  static clearExpiredCache(): void {
    const now = Date.now();
    tierCache.forEach((value, key) => {
      if (now - value.timestamp > TIER_CACHE_TTL) {
        tierCache.delete(key);
      }
    });
  }
}