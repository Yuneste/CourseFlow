import { createClient } from '@/lib/supabase/server';
import { SUBSCRIPTION_TIERS, isWithinLimit } from '@/lib/subscriptions/tiers';

export interface UsageMetrics {
  filesUploaded: number;
  aiSummariesUsed: number;
  storageUsed: number; // MB
  aiSpendThisMonth: number; // EUR
}

export class UsageTrackingService {
  /**
   * Get current usage metrics for a user
   */
  static async getUserUsage(userId: string): Promise<UsageMetrics> {
    const supabase = await createClient();
    
    // Get current month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get file upload count for this month
    const { count: filesUploaded } = await supabase
      .from('files')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString());

    // Get AI summaries count for this month
    const { data: aiUsageData } = await supabase
      .from('ai_usage_logs')
      .select('cost')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString());

    const aiSummariesUsed = aiUsageData?.length || 0;
    const aiSpendThisMonth = aiUsageData?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0;

    // Get total storage used
    const { data: storageData } = await supabase
      .from('files')
      .select('file_size')
      .eq('user_id', userId);

    const storageUsed = storageData?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;
    const storageUsedMB = Math.round(storageUsed / (1024 * 1024));

    return {
      filesUploaded: filesUploaded || 0,
      aiSummariesUsed,
      storageUsed: storageUsedMB,
      aiSpendThisMonth
    };
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
   */
  static async checkForAbusePatterns(userId: string): Promise<{
    suspicious: boolean;
    reasons: string[];
  }> {
    const supabase = await createClient();
    const reasons: string[] = [];

    // Check for rapid file uploads (>50 in 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { count: recentUploads } = await supabase
      .from('files')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo.toISOString());

    if ((recentUploads || 0) > 50) {
      reasons.push('Excessive file uploads detected');
    }

    // Check for files (simplified check without grouping)
    const { data: files, count: fileCount } = await supabase
      .from('files')
      .select('file_hash', { count: 'exact' })
      .eq('user_id', userId);

    // Simple check for suspicious file count
    if (fileCount && fileCount > 100) {
      reasons.push('Large number of files uploaded');
    }

    return {
      suspicious: reasons.length > 0,
      reasons
    };
  }
}