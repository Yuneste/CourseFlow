import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/service';
import { getStripe } from '@/lib/stripe/client';
import { SUBSCRIPTION_TIERS } from '@/lib/subscriptions/tiers';

export const runtime = 'nodejs'; // Ensure we're using Node.js runtime, not edge

export async function GET() {
  return NextResponse.json({ 
    message: 'Stripe webhook endpoint is active',
    method: 'Use POST to receive webhook events'
  });
}

export async function POST(req: Request) {
  console.log('[WEBHOOK] Endpoint hit at:', new Date().toISOString());
  
  let body: string;
  let signature: string | null;

  try {
    body = await req.text();
    console.log('[WEBHOOK] Body length:', body.length);
    console.log('[WEBHOOK] Body preview:', body.substring(0, 200));
    
    const headersList = await headers();
    signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('[WEBHOOK ERROR] No stripe signature found in headers');
      return new NextResponse('No signature', { status: 400 });
    }

    console.log('[WEBHOOK] Signature found:', signature.substring(0, 20) + '...');

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[WEBHOOK ERROR] STRIPE_WEBHOOK_SECRET not configured');
      return new NextResponse('Webhook secret not configured', { status: 500 });
    }

    console.log('[WEBHOOK] Secret configured:', webhookSecret.substring(0, 10) + '...');

    let event: Stripe.Event;

    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('[WEBHOOK] Event constructed successfully:', event.type, event.id);
    } catch (err: any) {
      console.error('[WEBHOOK ERROR] Signature verification failed:', err.message);
      console.error('[WEBHOOK ERROR] Full error:', JSON.stringify(err, null, 2));
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = createServiceClient();

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get customer details
        const customerId = session.customer as string;
        const customerEmail = session.customer_email || session.customer_details?.email;
        const stripe = getStripe();
        
        let email = customerEmail;
        if (!email) {
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          if (!customer.email) {
            console.error('No email found for customer:', customerId);
            break;
          }
          email = customer.email;
        }

        // Get subscription details
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Determine the plan based on price
        const priceId = subscription.items.data[0].price.id;
        const amount = subscription.items.data[0].price.unit_amount! / 100; // Convert cents to euros
        
        let tier: 'scholar' | 'master' = 'scholar';
        if (amount === 25 || amount === 240) {
          tier = 'master';
        }

        // First, find the user by email
        console.log('[WEBHOOK] Looking for user with email:', email);
        
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', email!)
          .single();

        if (fetchError || !profile) {
          console.error('[WEBHOOK ERROR] User not found with email:', email);
          console.error('[WEBHOOK ERROR] Fetch error:', fetchError);
          
          // Try case-insensitive search
          const { data: profileAlt, error: altError } = await supabase
            .from('profiles')
            .select('id, email')
            .ilike('email', email!)
            .single();
            
          if (altError) {
            console.error('[WEBHOOK ERROR] Case-insensitive search also failed:', altError);
          }
            
          if (profileAlt) {
            console.log('[WEBHOOK] Found user with different case email:', profileAlt.email);
          }
          
          // Return error to Stripe to retry later
          return new NextResponse('User not found', { status: 404 });
        }

        console.log(`[WEBHOOK] Updating user ${email} (ID: ${profile.id}) to ${tier} plan`);

        // Update user in database by ID
        const { data: updateData, error } = await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            has_access: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id)
          .select();

        if (error) {
          console.error('[WEBHOOK ERROR] Database update failed:', error);
          console.error('[WEBHOOK ERROR] Update details:', JSON.stringify(error, null, 2));
        } else {
          console.log(`[WEBHOOK SUCCESS] User ${email} upgraded to ${tier}`, updateData);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find user by stripe customer id
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('email')
          .eq('stripe_customer_id', customerId)
          .single();

        if (fetchError || !profile) {
          console.error('Error finding user:', fetchError);
          break;
        }

        // Downgrade to free tier
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_tier: 'explorer',
            subscription_status: 'canceled',
            has_access: false,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Error downgrading user:', error);
        } else {
          console.log(`User ${profile.email} downgraded to free tier`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Handle subscription status changes
        const status = subscription.status;
        const customerId = subscription.customer as string;

        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: status,
            has_access: status === 'active' || status === 'trialing',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Error updating subscription status:', error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return success response
    return NextResponse.json({ received: true }, { status: 200 });
    
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new NextResponse('Webhook Error: Handler failed', { status: 500 });
  }
}