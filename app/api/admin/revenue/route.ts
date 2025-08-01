import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RevenueOptimizationService } from '@/lib/services/revenue-optimization.service';

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

    // Get report type from query
    const reportType = request.nextUrl.searchParams.get('report') || 'full';
    const revenueService = RevenueOptimizationService.getInstance();

    let response;

    switch (reportType) {
      case 'metrics':
        response = await revenueService.calculateRevenueMetrics();
        break;
      
      case 'opportunities':
        response = await revenueService.identifyUpgradeOpportunities();
        break;
      
      case 'pricing':
        const tier = request.nextUrl.searchParams.get('tier') as 'scholar' | 'master';
        if (!tier || !['scholar', 'master'].includes(tier)) {
          return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
        }
        response = await revenueService.optimizePricing(tier);
        break;
      
      case 'full':
      default:
        response = await revenueService.generateRevenueReport();
        break;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Revenue report generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate revenue report' },
      { status: 500 }
    );
  }
}