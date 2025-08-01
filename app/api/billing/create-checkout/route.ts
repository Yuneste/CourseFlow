import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/client';
import { SUBSCRIPTION_TIERS } from '@/lib/subscriptions/tiers';
import { isDisposableEmail } from '@/lib/security/billing-limits';
import { performBillingSecurityCheck, logSecurityEvent } from '@/lib/security/billing-security';

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Perform comprehensive security checks
    const securityCheck = await performBillingSecurityCheck(req, user.id);
    if (!securityCheck.passed) {
      await logSecurityEvent(user.id, 'checkout_blocked', {
        reason: securityCheck.reason
      });
      
      return NextResponse.json(
        { error: securityCheck.reason || 'Security check failed' },
        { status: securityCheck.statusCode || 403 }
      );
    }

    // Block disposable emails for paid subscriptions
    if (user.email && isDisposableEmail(user.email)) {
      return NextResponse.json(
        { error: 'Disposable email addresses are not allowed for paid subscriptions' },
        { status: 400 }
      );
    }

    // Get request body
    const body = await req.json();
    const { tier, billingPeriod = 'monthly' } = body;

    // Validate tier
    if (!tier || !['scholar', 'master'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
    }

    const selectedTier = SUBSCRIPTION_TIERS[tier as 'scholar' | 'master'];
    if (!selectedTier.stripePriceId) {
      return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 });
    }

    // Get or create Stripe customer
    const stripe = getStripe();
    
    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          user_id: user.id,
        }
      });
      customerId = customer.id;

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedTier.stripePriceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7, // 7-day free trial
        metadata: {
          user_id: user.id,
          tier: tier,
        }
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      automatic_tax: {
        enabled: true, // Enable Stripe Tax for EU VAT
      },
      tax_id_collection: {
        enabled: true, // Allow B2B customers to add VAT ID
      },
      allow_promotion_codes: true, // Allow discount codes
      customer_update: {
        address: 'auto', // Update customer address for tax calculation
      },
      // Metadata for webhook processing
      metadata: {
        user_id: user.id,
        tier: tier,
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout session creation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}