'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

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
          <p className="text-muted-foreground">
            Unlock <span className="font-semibold text-courseflow-primary">{feature}</span> with an upgraded plan
          </p>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 mb-6">
        <span className={`text-sm ${!isYearly ? 'font-semibold' : 'text-muted-foreground'}`}>
          Monthly
        </span>
        <button
          onClick={() => setIsYearly(!isYearly)}
          className="relative w-12 h-6 bg-muted rounded-full transition-colors hover:bg-muted/80"
        >
          <motion.div
            className="absolute top-1 left-1 w-4 h-4 bg-courseflow-primary rounded-full"
            animate={{ x: isYearly ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
        <span className={`text-sm ${isYearly ? 'font-semibold' : 'text-muted-foreground'}`}>
          Yearly
        </span>
        {isYearly && (
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Save 20%
          </span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {availablePlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? 'border-courseflow-primary shadow-lg' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-courseflow-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                <Sparkles className="h-5 w-5 text-courseflow-primary" />
              </CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold text-foreground">
                  €{isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
                </span>
                <span className="text-muted-foreground">
                  /month
                </span>
                {isYearly && (
                  <div className="text-sm text-muted-foreground mt-1">
                    €{plan.yearlyPrice} billed annually
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
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