import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SUBSCRIPTION_TIERS } from '@/lib/subscriptions/tiers';
import { canUseAI, getRecommendedModel } from '@/lib/ai/cost-optimizer';

export interface CostProtectionResult {
  allowed: boolean;
  reason?: string;
  recommendation?: string;
  alternativeModel?: string;
  currentSpend: number;
  remainingBudget: number;
}

export class CostProtectionService {
  private static instance: CostProtectionService;

  static getInstance(): CostProtectionService {
    if (!this.instance) {
      this.instance = new CostProtectionService();
    }
    return this.instance;
  }

  async checkCostProtection(
    userId: string,
    feature: string,
    estimatedCost: number
  ): Promise<CostProtectionResult> {
    const supabase = createAdminClient();

    try {
      // Get user's subscription tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      const tier = profile?.subscription_tier || 'explorer';
      const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];

      // Get current month's spend
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const { data: usage } = await supabase
        .from('ai_usage_logs')
        .select('cost')
        .eq('user_id', userId)
        .gte('created_at', currentMonth.toISOString());

      const currentSpend = usage?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0;
      const maxSpend = tierConfig.maxAISpendPerMonth;
      const remainingBudget = maxSpend - currentSpend;

      // Check if operation is allowed
      const costCheck = canUseAI(currentSpend, maxSpend, estimatedCost);

      if (!costCheck.allowed) {
        return {
          allowed: false,
          reason: costCheck.reason,
          recommendation: 'Upgrade your plan or wait until next month',
          currentSpend,
          remainingBudget: Math.max(0, remainingBudget)
        };
      }

      // Check if we should recommend a cheaper model
      let alternativeModel;
      if (remainingBudget < maxSpend * 0.2) { // Less than 20% budget remaining
        alternativeModel = getRecommendedModel(feature as any, remainingBudget);
      }

      return {
        allowed: true,
        alternativeModel,
        currentSpend,
        remainingBudget,
        recommendation: alternativeModel 
          ? `Consider using ${alternativeModel} to save costs`
          : undefined
      };

    } catch (error) {
      console.error('Cost protection check failed:', error);
      // Fail open - allow the operation
      return {
        allowed: true,
        currentSpend: 0,
        remainingBudget: 0,
        recommendation: 'Unable to verify costs - proceeding with caution'
      };
    }
  }

  async enforceStorageLimit(userId: string): Promise<{
    allowed: boolean;
    currentUsage: number;
    limit: number;
    reason?: string;
  }> {
    const supabase = createAdminClient();

    try {
      // Get user's tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      const tier = profile?.subscription_tier || 'explorer';
      const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];

      // Get current storage usage
      const { data: files } = await supabase
        .from('files')
        .select('file_size')
        .eq('user_id', userId);

      const currentUsage = files?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;
      const limit = tierConfig.storageLimit;

      if (limit !== -1 && currentUsage >= limit) {
        return {
          allowed: false,
          currentUsage,
          limit,
          reason: 'Storage limit exceeded. Please upgrade your plan or delete some files.'
        };
      }

      return {
        allowed: true,
        currentUsage,
        limit
      };

    } catch (error) {
      console.error('Storage limit check failed:', error);
      return {
        allowed: true,
        currentUsage: 0,
        limit: -1
      };
    }
  }

  async throttleExpensiveOperations(userId: string): Promise<{
    throttled: boolean;
    waitTime?: number;
    reason?: string;
  }> {
    const supabase = createAdminClient();

    try {
      // Check recent expensive operations
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data: recentOps } = await supabase
        .from('ai_usage_logs')
        .select('created_at, cost')
        .eq('user_id', userId)
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false });

      if (!recentOps || recentOps.length === 0) {
        return { throttled: false };
      }

      // Check for rapid expensive operations
      const expensiveOps = recentOps.filter(op => op.cost > 0.01); // Operations over €0.01
      
      if (expensiveOps.length >= 5) {
        // Too many expensive operations in 5 minutes
        const lastOp = new Date(expensiveOps[0].created_at);
        const waitTime = 5 * 60 * 1000 - (Date.now() - lastOp.getTime());
        
        return {
          throttled: true,
          waitTime: Math.ceil(waitTime / 1000),
          reason: 'Too many expensive operations. Please wait before trying again.'
        };
      }

      // Check total cost in last 5 minutes
      const recentCost = recentOps.reduce((sum, op) => sum + (op.cost || 0), 0);
      if (recentCost > 0.10) { // More than €0.10 in 5 minutes
        return {
          throttled: true,
          waitTime: 300, // 5 minutes
          reason: 'High cost detected. Please slow down your usage.'
        };
      }

      return { throttled: false };

    } catch (error) {
      console.error('Throttle check failed:', error);
      return { throttled: false };
    }
  }

  async logCostProtectionEvent(
    userId: string,
    event: string,
    metadata: Record<string, any>
  ): Promise<void> {
    const supabase = createAdminClient();

    try {
      await supabase.from('usage_tracking').insert({
        user_id: userId,
        metric_type: `cost_protection_${event}`,
        metric_value: 1,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to log cost protection event:', error);
    }
  }

  async getSpendingForecast(userId: string): Promise<{
    currentMonthProjected: number;
    dailyAverage: number;
    daysRemaining: number;
    budgetStatus: 'safe' | 'warning' | 'critical';
  }> {
    const supabase = createAdminClient();

    try {
      // Get user's tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      const tier = profile?.subscription_tier || 'explorer';
      const maxSpend = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS].maxAISpendPerMonth;

      // Get current month's data
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysPassed = now.getDate();
      const daysRemaining = daysInMonth - daysPassed;

      const { data: usage } = await supabase
        .from('ai_usage_logs')
        .select('cost, created_at')
        .eq('user_id', userId)
        .gte('created_at', currentMonth.toISOString());

      const currentSpend = usage?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0;
      const dailyAverage = daysPassed > 0 ? currentSpend / daysPassed : 0;
      const currentMonthProjected = currentSpend + (dailyAverage * daysRemaining);

      let budgetStatus: 'safe' | 'warning' | 'critical' = 'safe';
      if (currentMonthProjected > maxSpend) {
        budgetStatus = 'critical';
      } else if (currentMonthProjected > maxSpend * 0.8) {
        budgetStatus = 'warning';
      }

      return {
        currentMonthProjected,
        dailyAverage,
        daysRemaining,
        budgetStatus
      };

    } catch (error) {
      console.error('Spending forecast failed:', error);
      return {
        currentMonthProjected: 0,
        dailyAverage: 0,
        daysRemaining: 30,
        budgetStatus: 'safe'
      };
    }
  }
}