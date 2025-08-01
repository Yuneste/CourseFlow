import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkCountryCompliance, getMinimumAge } from '@/lib/compliance/international';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's country from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('country')
      .eq('id', user.id)
      .single();

    const country = profile?.country || 'US';
    
    // Check compliance requirements
    const compliance = checkCountryCompliance(country);
    const minimumAge = getMinimumAge(country);

    return NextResponse.json({
      country,
      compliance,
      minimumAge,
      features: {
        vatCollection: compliance.requirements.some(r => r.includes('VAT')),
        gdprCompliant: compliance.requirements.some(r => r.includes('GDPR')),
        localPaymentMethods: compliance.requirements.some(r => r.includes('local payment')),
        dataLocalization: compliance.issues.some(i => i.includes('localization'))
      }
    });
  } catch (error) {
    console.error('Compliance check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check compliance' },
      { status: 500 }
    );
  }
}