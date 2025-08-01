export interface ModelConfig {
  model: string;
  costPer1kTokens: number; // EUR
}

export interface TokenLimits {
  summary: number;
  flashcards: number;
  categorization: number;
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number; // seconds
  similarityThreshold: number; // 0-1
}

export const AI_COST_OPTIMIZATION = {
  // Model selection by task - prioritize GPT-3.5 for cost savings
  modelSelection: {
    fileNaming: 'gpt-3.5-turbo',        // €0.0015/1K tokens
    basicSummary: 'gpt-3.5-turbo',      // €0.0015/1K tokens
    complexAnalysis: 'gpt-4-turbo',     // €0.01/1K tokens (only when needed)
    flashcards: 'gpt-3.5-turbo'         // €0.0015/1K tokens
  },
  
  // Token limits by feature to control costs
  tokenLimits: {
    summary: 500,        // ~€0.0008 per summary
    flashcards: 1000,    // ~€0.0015 per set
    categorization: 200  // ~€0.0003 per file
  },
  
  // Caching strategy to reduce duplicate API calls
  caching: {
    enabled: true,
    ttl: 30 * 24 * 60 * 60, // 30 days
    similarityThreshold: 0.95 // Cache if 95% similar
  },

  // Cost per 1K tokens in EUR (approximate)
  modelCosts: {
    'gpt-3.5-turbo': 0.0015,
    'gpt-4-turbo': 0.01,
    'gpt-4': 0.03
  }
};

// Calculate estimated cost for a task
export function estimateTaskCost(
  model: string, 
  estimatedTokens: number
): number {
  const costPer1k = AI_COST_OPTIMIZATION.modelCosts[model as keyof typeof AI_COST_OPTIMIZATION.modelCosts] || 0.01;
  return (estimatedTokens / 1000) * costPer1k;
}

// Check if AI usage is allowed for user based on their tier limits
export function canUseAI(
  currentMonthSpend: number,
  maxMonthlySpend: number,
  taskCost: number
): { allowed: boolean; reason?: string } {
  if (currentMonthSpend + taskCost > maxMonthlySpend) {
    return {
      allowed: false,
      reason: `Monthly AI limit reached (€${maxMonthlySpend.toFixed(2)})`
    };
  }

  // Check if user is at 80% of limit - suggest throttling
  if (currentMonthSpend + taskCost > maxMonthlySpend * 0.8) {
    // Could implement automatic downgrade to cheaper model here
    console.warn('User approaching AI spend limit');
  }

  return { allowed: true };
}

// Get recommended model based on user's remaining budget
export function getRecommendedModel(
  taskType: keyof typeof AI_COST_OPTIMIZATION.modelSelection,
  remainingBudget: number
): string {
  const preferredModel = AI_COST_OPTIMIZATION.modelSelection[taskType];
  const estimatedCost = estimateTaskCost(
    preferredModel,
    AI_COST_OPTIMIZATION.tokenLimits[taskType as keyof TokenLimits] || 500
  );

  // If preferred model would exceed budget, downgrade to GPT-3.5
  if (estimatedCost > remainingBudget && preferredModel !== 'gpt-3.5-turbo') {
    return 'gpt-3.5-turbo';
  }

  return preferredModel;
}