'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { lightThemeClasses } from '@/lib/theme/light-theme';

interface UpgradePromptProps {
  currentPlan?: 'explorer' | 'scholar' | 'master';
  feature?: string;
}

export function UpgradePrompt({ currentPlan = 'explorer', feature }: UpgradePromptProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUserEmail();
  }, [supabase]);

  const plans = [
    {
      id: 'scholar',
      name: 'Scholar',
      monthlyPrice: 10,
      yearlyPrice: 96,
      features: [
        '5GB storage space',
        '100 AI summaries/month',
        'Unlimited courses',
        'Join up to 5 study groups',
        'Document annotation',
        'Progress tracking'
      ],
      monthlyLink: 'https://buy.stripe.com/test_dRmeVdc3ucf2cgl2fn9sk00',
      yearlyLink: 'https://buy.stripe.com/test_28E6oH3wYfrecgl9HP9sk01'
    },
    {
      id: 'master',
      name: 'Master',
      monthlyPrice: 25,
      yearlyPrice: 240,
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
      monthlyLink: 'https://buy.stripe.com/test_aFa4gzgjK0wk6W16vD9sk02',
      yearlyLink: 'https://buy.stripe.com/test_8x23cv9Vmdj6eot1bj9sk03',
      popular: true
    }
  ];

  const availablePlans = plans.filter(plan => 
    currentPlan === 'explorer' || (currentPlan === 'scholar' && plan.id === 'master')
  );

  const handleUpgrade = (paymentLink: string) => {
    const url = new URL(paymentLink);
    if (userEmail) {
      url.searchParams.set('prefilled_email', userEmail);
    }
    window.open(url.toString(), '_blank');
  };

  if (availablePlans.length === 0) {
    return null; // Already on highest plan
  }

  return (
    <div className="space-y-6">
      {feature && (
        <div className="text-center mb-4">
          <p className="text-gray-600">
            Unlock <span className="font-semibold text-[#8CC2BE]">{feature}</span> with an upgraded plan
          </p>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 mb-6">
        <span className={`text-sm ${!isYearly ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
          Monthly
        </span>
        <button
          onClick={() => setIsYearly(!isYearly)}
          className="relative w-12 h-6 bg-gray-200 rounded-full transition-colors hover:bg-gray-300"
        >
          <motion.div
            className="absolute top-1 left-1 w-4 h-4 bg-[#8CC2BE] rounded-full"
            animate={{ x: isYearly ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
        <span className={`text-sm ${isYearly ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
          Yearly
        </span>
        {isYearly && (
          <span className="bg-[#49C993] text-white text-xs px-2 py-1 rounded-full font-semibold">
            Save 20%
          </span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {availablePlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={cn(
              lightThemeClasses.card.base,
              "relative",
              plan.popular && "border-[#8CC2BE] shadow-lg scale-105"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFC194] text-gray-900 px-3 py-1 rounded-full text-xs font-semibold border border-[#FFB074]">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-gray-900">{plan.name}</span>
                <div className="p-2 bg-[#E6F7F5] rounded-lg">
                  <Sparkles className="h-5 w-5 text-[#8CC2BE]" />
                </div>
              </CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold text-gray-900">
                  €{isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
                </span>
                <span className="text-gray-600">
                  /month
                </span>
                {isYearly && (
                  <div className="text-sm text-gray-500 mt-1">
                    €{plan.yearlyPrice} billed annually
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#49C993] mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className={cn(
                  "w-full",
                  plan.popular ? lightThemeClasses.button.primary : lightThemeClasses.button.secondary
                )}
                onClick={() => handleUpgrade(isYearly ? plan.yearlyLink : plan.monthlyLink)}
              >
                Upgrade to {plan.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}