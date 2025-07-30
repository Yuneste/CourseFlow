import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// TEMPORARY: Manual subscription fix endpoint
// Remove this after debugging
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Manually update to Scholar plan (since you paid for €10)
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'scholar',
        subscription_status: 'active',
        stripe_customer_id: 'manual_fix_' + Date.now(), // Temporary ID
        has_access: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
      
    if (error) {
      return NextResponse.json({ 
        error: 'Failed to update subscription', 
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      message: 'Subscription manually updated to Scholar plan',
      note: 'This is temporary - webhook issue needs to be fixed'
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error 
    }, { status: 500 });
  }
}