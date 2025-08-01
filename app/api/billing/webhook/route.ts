import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const runtime = 'nodejs'; // Ensure we're using Node.js runtime, not edge

export async function POST(req: Request) {
  console.log('Webhook endpoint hit');
  
  let body: string;
  let signature: string | null;

  try {
    body = await req.text();
    console.log('Body length:', body.length);
    
    const headersList = await headers();
    signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('No stripe signature found');
      return new NextResponse('No signature', { status: 400 });
    }

    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return new NextResponse('Webhook secret not configured', { status: 500 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new NextResponse('Webhook Error: Invalid signature', { status: 400 });
    }

    const supabase = createServiceClient();

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get customer details
        const customerId = session.customer as string;
        const customerEmail = session.customer_email || session.customer_details?.email;
        
        if (!customerEmail) {
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          if (!customer.email) {
            console.error('No email found for customer:', customerId);
            break;
          }
        }
        
        const email = customerEmail || (await stripe.customers.retrieve(customerId) as Stripe.Customer).email;

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
        console.log('Looking for user with email:', email);
        
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', email!)
          .single();

        if (fetchError || !profile) {
          console.error('User not found with email:', email);
          console.error('Fetch error:', fetchError);
          
          // Try case-insensitive search
          const { data: profileAlt } = await supabase
            .from('profiles')
            .select('id, email')
            .ilike('email', email!)
            .single();
            
          if (profileAlt) {
            console.log('Found user with different case email:', profileAlt.email);
            // Return error to Stripe to retry later
            return new NextResponse('User not found', { status: 404 });
          }
          
          break;
        }

        console.log(`Updating user ${email} (ID: ${profile.id}) to ${tier} plan`);

        // Update user in database by ID
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            has_access: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        if (error) {
          console.error('Error updating user subscription:', error);
        } else {
          console.log(`User ${email} upgraded to ${tier}`);
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