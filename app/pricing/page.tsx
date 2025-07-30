import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UpgradePrompt } from '@/components/pricing/upgrade-prompt';
import { UnifiedBackground, UnifiedSection } from '@/components/ui/unified-background';
import { motion } from 'framer-motion';

export default async function PricingPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile with subscription info
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  const currentPlan = profile?.subscription_tier || 'explorer';

  return (
    <UnifiedBackground>
      <UnifiedSection>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
            <p className="text-muted-foreground">
              Unlock powerful features to enhance your academic journey
            </p>
          </div>

          <UpgradePrompt currentPlan={currentPlan as 'explorer' | 'scholar' | 'master'} />
        </div>
      </UnifiedSection>
    </UnifiedBackground>
  );
}