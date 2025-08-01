'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function CustomerPortalButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleOpenPortal = async () => {
    setLoading(true);
    
    try {
      // Get user email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        console.error('No user email found');
        return;
      }

      // Get user's stripe customer ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single();

      if (!profile?.stripe_customer_id || profile.stripe_customer_id.startsWith('manual_fix_')) {
        console.log('No valid Stripe subscription found');
        alert('Please complete a new subscription through the pricing page to access the customer portal.');
        return;
      }

      // Create portal session
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: profile.stripe_customer_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Portal API error:', errorData);
        alert('Unable to open customer portal. Please try again later.');
        return;
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No portal URL received');
        alert('Unable to open customer portal. Please try again later.');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleOpenPortal}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Settings className="h-4 w-4" />
      )}
      Manage Subscription
    </Button>
  );
}