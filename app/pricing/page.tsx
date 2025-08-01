import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PricingClient } from './pricing-client';
import { lightTheme, lightThemeClasses } from '@/lib/theme/light-theme';

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
    <div className={lightThemeClasses.page.wrapper}>
      <div className={lightThemeClasses.page.container + " py-8"}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#3B82F6] mb-2">Choose Your Plan</h1>
            <p className="text-gray-600">
              Unlock powerful features to enhance your academic journey
            </p>
          </div>

          <PricingClient currentPlan={currentPlan as 'explorer' | 'scholar' | 'master'} />
        </div>
      </div>
    </div>
  );
}