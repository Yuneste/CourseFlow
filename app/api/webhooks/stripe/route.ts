import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';
import Stripe from 'stripe';
import { 
  checkWebhookRateLimit, 
  isEventProcessed, 
  markEventProcessed 
} from '@/lib/security/webhook-protection';

const stripe = getStripe();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  // Rate limiting check
  const clientIp = headers().get('x-forwarded-for') || 'unknown';
  const rateLimitCheck = checkWebhookRateLimit(`stripe-webhook:${clientIp}`);
  
  if (!rateLimitCheck.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: {
          'Retry-After': rateLimitCheck.retryAfter?.toString() || '60'
        }
      }
    );
  }

  const body = await request.text();
  const sig = headers().get('stripe-signature');

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Check for duplicate events
  if (isEventProcessed(event.id)) {
    console.log(`Duplicate event ${event.id} - skipping`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract user ID from metadata
        const userId = session.metadata?.userId;
        if (!userId) {
          console.error('No userId in session metadata');
          return NextResponse.json({ error: 'Invalid session metadata' }, { status: 400 });
        }

        // Get the subscription
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Determine tier based on price
        const priceId = subscription.items.data[0].price.id;
        let tier = 'explorer';
        
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_SCHOLAR_PRICE_ID_MONTHLY ||
            priceId === process.env.NEXT_PUBLIC_STRIPE_SCHOLAR_PRICE_ID_YEARLY) {
          tier = 'scholar';
        } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_MASTER_PRICE_ID_MONTHLY ||
                   priceId === process.env.NEXT_PUBLIC_STRIPE_MASTER_PRICE_ID_YEARLY) {
          tier = 'master';
        }

        // Update user profile
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.error('Failed to update profile:', error);
          return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Get user by stripe_subscription_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (profileError || !profile) {
          console.error('Profile not found for subscription:', subscription.id);
          return NextResponse.json({ error: 'Profile not found' }, { status: 400 });
        }

        // Determine tier based on price
        const priceId = subscription.items.data[0].price.id;
        let tier = 'explorer';
        
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_SCHOLAR_PRICE_ID_MONTHLY ||
            priceId === process.env.NEXT_PUBLIC_STRIPE_SCHOLAR_PRICE_ID_YEARLY) {
          tier = 'scholar';
        } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_MASTER_PRICE_ID_MONTHLY ||
                   priceId === process.env.NEXT_PUBLIC_STRIPE_MASTER_PRICE_ID_YEARLY) {
          tier = 'master';
        }

        // Update subscription status
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_status: subscription.status,
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('id', profile.id);

        if (error) {
          console.error('Failed to update subscription:', error);
          return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Get user by stripe_subscription_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (profileError || !profile) {
          console.error('Profile not found for subscription:', subscription.id);
          return NextResponse.json({ error: 'Profile not found' }, { status: 400 });
        }

        // Downgrade to free tier
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_tier: 'explorer',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
            subscription_current_period_end: null
          })
          .eq('id', profile.id);

        if (error) {
          console.error('Failed to cancel subscription:', error);
          return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Get user by stripe_customer_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', invoice.customer as string)
          .single();

        if (profileError || !profile) {
          console.error('Profile not found for customer:', invoice.customer);
          return NextResponse.json({ error: 'Profile not found' }, { status: 400 });
        }

        // Update subscription status
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due'
          })
          .eq('id', profile.id);

        if (error) {
          console.error('Failed to update payment status:', error);
          return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    markEventProcessed(event.id);
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Stripe requires raw body for webhook signature verification
export const runtime = 'nodejs';