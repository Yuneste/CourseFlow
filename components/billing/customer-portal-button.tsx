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

      if (!profile?.stripe_customer_id) {
        console.log('No active subscription found');
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

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
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