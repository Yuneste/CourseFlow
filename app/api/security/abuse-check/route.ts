import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { detectAbusePatterns, detectCostAnomalies } from '@/lib/security/abuse-prevention';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get user ID from query params
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Run abuse detection
    const [abuseResult, costAnomaly] = await Promise.all([
      detectAbusePatterns(userId),
      detectCostAnomalies(userId)
    ]);

    return NextResponse.json({
      userId,
      abuseDetection: abuseResult,
      costAnomaly,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Abuse check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check for abuse' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Self-check for current user
    const [abuseResult, costAnomaly] = await Promise.all([
      detectAbusePatterns(user.id),
      detectCostAnomalies(user.id)
    ]);

    // Don't reveal full details to users, just warnings
    const warnings: string[] = [];
    
    if (abuseResult.riskScore > 40) {
      warnings.push('Unusual activity detected on your account');
    }
    
    if (costAnomaly.anomalyDetected) {
      warnings.push('Higher than normal usage detected this month');
    }

    return NextResponse.json({
      warnings,
      riskLevel: abuseResult.riskScore > 60 ? 'high' : 
                 abuseResult.riskScore > 40 ? 'medium' : 'low',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Self abuse check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check account status' },
      { status: 500 }
    );
  }
}