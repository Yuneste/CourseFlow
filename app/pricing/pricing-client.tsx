'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { lightTheme, lightThemeClasses } from '@/lib/theme/light-theme';
import { SUBSCRIPTION_TIERS } from '@/lib/subscriptions/tiers';
import { toast } from 'sonner';

interface PricingClientProps {
  currentPlan: 'explorer' | 'scholar' | 'master';
}

export function PricingClient({ currentPlan }: PricingClientProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const plans = [
    {
      id: 'scholar' as const,
      tier: SUBSCRIPTION_TIERS.scholar,
      features: [
        '5GB storage space',
        '100 AI summaries/month',
        'Unlimited courses',
        'Join up to 5 study groups',
        'Document annotation',
        'Progress tracking'
      ],
      yearlyDiscount: 0.2 // 20% discount
    },
    {
      id: 'master' as const,
      tier: SUBSCRIPTION_TIERS.master,
      features: [
        '50GB storage space',
        '500 AI summaries/month',
        'Unlimited courses',
        'Unlimited study groups',
        'Priority AI processing',
        'Advanced analytics',
        'Export to any format',
        'Priority support'
      ],
      yearlyDiscount: 0.2,
      popular: true
    }
  ];

  const availablePlans = plans.filter(plan => 
    currentPlan === 'explorer' || (currentPlan === 'scholar' && plan.id === 'master')
  );

  const handleUpgrade = async (tierId: 'scholar' | 'master', billingPeriod: 'monthly' | 'yearly') => {
    setIsLoading(tierId);
    
    try {
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tier: tierId,
          billingPeriod 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start checkout');
      setIsLoading(null);
    }
  };

  if (availablePlans.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="p-4 bg-[#E0E7FF] rounded-full inline-block mb-4">
          <Sparkles className="h-8 w-8 text-[#6366F1]" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          You&apos;re already on the highest plan!
        </h3>
        <p className="text-gray-600">
          Enjoy all the features of CourseFlow Master.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Billing Period Toggle */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <span className={cn(
          "text-sm",
          !isYearly ? 'font-semibold text-gray-900' : 'text-gray-500'
        )}>
          Monthly
        </span>
        <button
          onClick={() => setIsYearly(!isYearly)}
          className="relative w-12 h-6 bg-gray-200 rounded-full transition-colors hover:bg-gray-300"
        >
          <motion.div
            className="absolute top-1 left-1 w-4 h-4 bg-[#6366F1] rounded-full"
            animate={{ x: isYearly ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
        <span className={cn(
          "text-sm",
          isYearly ? 'font-semibold text-gray-900' : 'text-gray-500'
        )}>
          Yearly
        </span>
        {isYearly && (
          <span className="bg-[#3B82F6] text-white text-xs px-2 py-1 rounded-full font-semibold">
            Save 20%
          </span>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {availablePlans.map((plan) => {
          const monthlyPrice = plan.tier.price;
          const yearlyPrice = monthlyPrice * 12 * (1 - plan.yearlyDiscount);
          const displayPrice = isYearly ? Math.round(yearlyPrice / 12) : monthlyPrice;
          
          return (
            <Card 
              key={plan.id} 
              className={cn(
                lightThemeClasses.card.base,
                "relative",
                plan.popular && "border-[#6366F1] shadow-lg scale-105"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8B5CF6] text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-gray-900">{plan.tier.name}</span>
                  <div className="p-2 bg-[#E0E7FF] rounded-lg">
                    <Sparkles className="h-5 w-5 text-[#6366F1]" />
                  </div>
                </CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-gray-900">
                    €{displayPrice}
                  </span>
                  <span className="text-gray-600">
                    /month
                  </span>
                  {isYearly && (
                    <div className="text-sm text-gray-500 mt-1">
                      €{Math.round(yearlyPrice)} billed annually
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-[#3B82F6] mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={cn(
                    "w-full",
                    plan.popular ? lightThemeClasses.button.primary : lightThemeClasses.button.secondary
                  )}
                  onClick={() => handleUpgrade(plan.id, isYearly ? 'yearly' : 'monthly')}
                  disabled={isLoading !== null}
                >
                  {isLoading === plan.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Upgrade to ${plan.tier.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Free Trial Notice */}
      <div className="text-center text-sm text-gray-600 mt-6">
        <p>🎉 All plans include a <span className="font-semibold">7-day free trial</span></p>
        <p className="mt-1">Cancel anytime • No credit card required for trial</p>
      </div>
    </div>
  );
}