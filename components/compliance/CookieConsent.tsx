'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cookie, Shield, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { COMPLIANCE_REQUIREMENTS } from '@/lib/compliance/international';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Determine consent level based on user's region
      const country = localStorage.getItem('user-country') || 'US';
      const requiresExplicit = COMPLIANCE_REQUIREMENTS.gdpr.includes(country);
      
      if (requiresExplicit) {
        setShowBanner(true);
      } else {
        // For non-GDPR countries, implied consent with opt-out
        acceptAll();
      }
    }
  }, []);

  const acceptAll = () => {
    const fullConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookie-consent', JSON.stringify(fullConsent));
    setShowBanner(false);
    
    // Initialize analytics
    if (fullConsent.analytics) {
      // Initialize analytics tracking
      console.log('Analytics enabled');
    }
  };

  const acceptSelected = () => {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setShowBanner(false);
    
    // Initialize based on preferences
    if (consent.analytics) {
      console.log('Analytics enabled');
    }
  };

  const rejectAll = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookie-consent', JSON.stringify(minimalConsent));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
      >
        <Card className="mx-auto max-w-4xl p-6 shadow-xl border-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Cookie className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Cookie Preferences</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
                  By clicking &quot;Accept All&quot;, you consent to our use of cookies.
                </p>
                
                {showDetails && (
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between py-2 border-t">
                      <div>
                        <p className="font-medium text-sm">Necessary Cookies</p>
                        <p className="text-xs text-muted-foreground">Required for basic site functionality</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.necessary}
                        disabled
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-sm">Analytics Cookies</p>
                        <p className="text-xs text-muted-foreground">Help us understand how you use our site</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-sm">Marketing Cookies</p>
                        <p className="text-xs text-muted-foreground">Used to show relevant ads</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                        className="h-4 w-4"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={acceptAll}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Accept All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? 'Hide' : 'Customize'} Settings
                  </Button>
                  {showDetails && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={acceptSelected}
                    >
                      Accept Selected
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={rejectAll}
                  >
                    Reject All
                  </Button>
                </div>
                
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <a href="/privacy" className="hover:underline">Privacy Policy</a>
                  <a href="/cookies" className="hover:underline">Cookie Policy</a>
                </div>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              className="p-1"
              onClick={() => setShowBanner(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}