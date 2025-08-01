import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get user profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch profile', 
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      email: user.email,
      profile: {
        subscription_tier: profile?.subscription_tier || 'NOT_FOUND',
        subscription_status: profile?.subscription_status || 'NOT_FOUND',
        stripe_customer_id: profile?.stripe_customer_id || 'NOT_FOUND',
        has_access: profile?.has_access ?? 'NOT_FOUND'
      }
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error 
    }, { status: 500 });
  }
}