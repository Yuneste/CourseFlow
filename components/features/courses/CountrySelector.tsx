'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Globe } from 'lucide-react';

const COUNTRIES = {
  US: { name: 'United States', flag: '🇺🇸' },
  CA: { name: 'Canada', flag: '🇨🇦' },
  UK: { name: 'United Kingdom', flag: '🇬🇧' },
  DE: { name: 'Germany', flag: '🇩🇪' },
  NL: { name: 'Netherlands', flag: '🇳🇱' },
};

interface CountrySelectorProps {
  open: boolean;
  onSelect: (country: string) => Promise<void>;
}

export function CountrySelector({ open, onSelect }: CountrySelectorProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = async (country: string) => {
    setIsLoading(true);
    try {
      await onSelect(country);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Select Your Country
          </DialogTitle>
          <DialogDescription>
            Choose your country to customize your academic calendar
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          {Object.entries(COUNTRIES).map(([code, country]) => (
            <Button
              key={code}
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => handleSelect(code)}
              disabled={isLoading}
            >
              <span className="text-2xl mr-3">{country.flag}</span>
              <span className="font-medium">{country.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}