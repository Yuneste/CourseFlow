'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { lightThemeClasses } from '@/lib/theme/light-theme';

interface DynamicPricingProps {
  userId?: string;
  currentTier?: string;
  showPersonalized?: boolean;
}

interface PricingOffer {
  tier: string;
  basePrice: number;
  discountedPrice?: number;
  discountPercentage?: number;
  offerType?: 'upgrade' | 'retention' | 'seasonal';
  expiresAt?: Date;
  features: string[];
}

export function DynamicPricing({ 
  userId, 
  currentTier = 'explorer',
  showPersonalized = true 
}: DynamicPricingProps) {
  const [offers, setOffers] = useState<PricingOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (showPersonalized && userId) {
      fetchPersonalizedOffers();
    } else {
      setDefaultOffers();
    }
  }, [userId, showPersonalized]);

  useEffect(() => {
    // Update countdown timer
    const timer = setInterval(() => {
      const offer = offers.find(o => o.expiresAt);
      if (offer?.expiresAt) {
        const now = new Date();
        const expires = new Date(offer.expiresAt);
        const diff = expires.getTime() - now.getTime();
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft('Expired');
        }
      }
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [offers]);

  const fetchPersonalizedOffers = async () => {
    try {
      const response = await fetch('/api/pricing/personalized');
      if (response.ok) {
        const data = await response.json();
        setOffers(data.offers);
      } else {
        setDefaultOffers();
      }
    } catch (error) {
      console.error('Failed to fetch personalized offers:', error);
      setDefaultOffers();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultOffers = () => {
    const defaultOffers: PricingOffer[] = [
      {
        tier: 'explorer',
        basePrice: 0,
        features: [
          '5 courses',
          '10 files per course',
          '100MB storage',
          '5 AI summaries per month'
        ]
      },
      {
        tier: 'scholar',
        basePrice: 10,
        features: [
          'Unlimited courses',
          'Unlimited files',
          '10GB storage',
          '50 AI summaries per month',
          'Advanced analytics'
        ]
      },
      {
        tier: 'master',
        basePrice: 25,
        features: [
          'Everything in Scholar',
          '100GB storage',
          'Unlimited AI features',
          'Priority support',
          'Early access to features'
        ]
      }
    ];

    // Add upgrade discount for current users
    if (currentTier === 'explorer') {
      defaultOffers[1].discountedPrice = 8;
      defaultOffers[1].discountPercentage = 20;
      defaultOffers[1].offerType = 'upgrade';
      defaultOffers[1].expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
    }

    setOffers(defaultOffers);
    setLoading(false);
  };

  const handleCheckout = async (tier: string, price: number) => {
    // Track pricing interaction
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'pricing_clicked',
        properties: { tier, price, hasDiscount: price < 10 }
      })
    });

    // Redirect to checkout
    window.location.href = `/checkout?tier=${tier}&price=${price}`;
  };

  if (loading) {
    return <div className="animate-pulse">Loading pricing...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {offers.map((offer, index) => (
        <motion.div
          key={offer.tier}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={cn(
            "relative p-6 h-full",
            offer.tier === 'scholar' && "border-2 border-blue-500",
            offer.discountedPrice && "ring-2 ring-green-500"
          )}>
            {/* Special offer badge */}
            {offer.offerType && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500">
                <Sparkles className="h-3 w-3 mr-1" />
                {offer.discountPercentage}% OFF
              </Badge>
            )}

            {/* Tier name */}
            <h3 className="text-2xl font-bold mb-2 capitalize">
              {offer.tier}
              {offer.tier === currentTier && (
                <Badge variant="secondary" className="ml-2">Current</Badge>
              )}
            </h3>

            {/* Pricing */}
            <div className="mb-6">
              {offer.discountedPrice ? (
                <div>
                  <span className="text-3xl font-bold text-green-600">
                    €{offer.discountedPrice}
                  </span>
                  <span className="text-xl line-through text-gray-400 ml-2">
                    €{offer.basePrice}
                  </span>
                  <span className="text-sm text-gray-600">/month</span>
                  {offer.expiresAt && timeLeft && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-orange-600">
                      <Clock className="h-3 w-3" />
                      Expires in {timeLeft}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <span className="text-3xl font-bold">
                    {offer.basePrice === 0 ? 'Free' : `€${offer.basePrice}`}
                  </span>
                  {offer.basePrice > 0 && (
                    <span className="text-sm text-gray-600">/month</span>
                  )}
                </div>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-6">
              {offer.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button
              className={cn(
                "w-full",
                offer.tier === 'scholar' && lightThemeClasses.button.primary,
                offer.tier === 'master' && "bg-purple-600 hover:bg-purple-700",
                offer.discountedPrice && "animate-pulse"
              )}
              onClick={() => handleCheckout(
                offer.tier,
                offer.discountedPrice || offer.basePrice
              )}
              disabled={offer.tier === currentTier && !offer.discountedPrice}
            >
              {offer.tier === currentTier && !offer.discountedPrice
                ? 'Current Plan'
                : offer.tier === 'explorer'
                ? 'Get Started'
                : offer.discountedPrice
                ? 'Claim Offer'
                : 'Upgrade Now'}
            </Button>

            {/* Urgency indicator */}
            {offer.offerType === 'upgrade' && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Based on your usage patterns
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}