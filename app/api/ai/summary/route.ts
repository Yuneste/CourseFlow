import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CostProtectionService } from '@/lib/services/cost-protection.service';
import { estimateTaskCost, AI_COST_OPTIMIZATION } from '@/lib/ai/cost-optimizer';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text, fileId } = body;

    if (!text || !fileId) {
      return NextResponse.json(
        { error: 'Text and fileId are required' },
        { status: 400 }
      );
    }

    // Initialize cost protection service
    const costProtection = CostProtectionService.getInstance();

    // Check throttling
    const throttleCheck = await costProtection.throttleExpensiveOperations(user.id);
    if (throttleCheck.throttled) {
      return NextResponse.json(
        {
          error: 'Rate limited',
          message: throttleCheck.reason,
          retryAfter: throttleCheck.waitTime
        },
        { status: 429 }
      );
    }

    // Estimate cost for this operation
    const model = AI_COST_OPTIMIZATION.modelSelection.basicSummary;
    const estimatedTokens = AI_COST_OPTIMIZATION.tokenLimits.summary;
    const estimatedCost = estimateTaskCost(model, estimatedTokens);

    // Check cost protection
    const costCheck = await costProtection.checkCostProtection(
      user.id,
      'summary',
      estimatedCost
    );

    if (!costCheck.allowed) {
      await costProtection.logCostProtectionEvent(user.id, 'blocked', {
        feature: 'summary',
        reason: costCheck.reason,
        estimatedCost
      });

      return NextResponse.json(
        {
          error: 'Cost limit exceeded',
          message: costCheck.reason,
          recommendation: costCheck.recommendation,
          currentSpend: costCheck.currentSpend,
          remainingBudget: costCheck.remainingBudget
        },
        { status: 402 } // Payment Required
      );
    }

    // Use alternative model if recommended
    const actualModel = costCheck.alternativeModel || model;

    // Simulate AI processing (replace with actual OpenAI call)
    const summary = await generateSummary(text, actualModel);
    const actualCost = estimatedCost; // In production, calculate actual tokens used

    // Log AI usage
    const adminSupabase = createAdminClient();
    await adminSupabase.from('ai_usage_logs').insert({
      user_id: user.id,
      feature: 'summary',
      tokens_used: estimatedTokens,
      cost: actualCost,
      model: actualModel
    });

    // Update file with summary
    await supabase
      .from('files')
      .update({ ai_summary: summary })
      .eq('id', fileId)
      .eq('user_id', user.id);

    // Return response with cost information
    return NextResponse.json({
      summary,
      costInfo: {
        cost: actualCost,
        model: actualModel,
        remainingBudget: costCheck.remainingBudget - actualCost,
        recommendation: costCheck.recommendation
      }
    });

  } catch (error) {
    console.error('AI summary generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

// Mock function - replace with actual OpenAI integration
async function generateSummary(text: string, model: string): Promise<string> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return `This is a summary of the provided text using model ${model}. The text discusses various topics and concepts that are relevant to academic study.`;
}