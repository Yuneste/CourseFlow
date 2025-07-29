'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    // Check if high contrast is already enabled
    const saved = localStorage.getItem('high-contrast');
    const enabled = saved === 'true';
    setIsHighContrast(enabled);
    
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  const toggleHighContrast = () => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    localStorage.setItem('high-contrast', newValue.toString());
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  return { isHighContrast, toggleHighContrast };
}

interface HighContrastToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function HighContrastToggle({ className, showLabel = true }: HighContrastToggleProps) {
  const { isHighContrast, toggleHighContrast } = useHighContrast();

  return (
    <Button
      variant="outline"
      size={showLabel ? 'default' : 'icon'}
      onClick={toggleHighContrast}
      className={cn(
        'relative',
        isHighContrast && 'bg-black text-white border-white hover:bg-gray-900',
        className
      )}
      aria-label={`${isHighContrast ? 'Disable' : 'Enable'} high contrast mode`}
      aria-pressed={isHighContrast}
    >
      <Eye className={cn('h-4 w-4', showLabel && 'mr-2')} />
      {showLabel && (
        <span>{isHighContrast ? 'Normal Contrast' : 'High Contrast'}</span>
      )}
    </Button>
  );
}

// High contrast styles to be added to globals.css
export const highContrastStyles = `
/* High Contrast Mode */
.high-contrast {
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 0%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 0%;
  --primary: 0 0% 0%;
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 90%;
  --secondary-foreground: 0 0% 0%;
  --muted: 0 0% 85%;
  --muted-foreground: 0 0% 0%;
  --accent: 0 0% 80%;
  --accent-foreground: 0 0% 0%;
  --destructive: 0 100% 50%;
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 0%;
  --input: 0 0% 0%;
  --ring: 0 0% 0%;
}

.high-contrast.dark {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
  --card: 0 0% 0%;
  --card-foreground: 0 0% 100%;
  --popover: 0 0% 0%;
  --popover-foreground: 0 0% 100%;
  --primary: 0 0% 100%;
  --primary-foreground: 0 0% 0%;
  --secondary: 0 0% 10%;
  --secondary-foreground: 0 0% 100%;
  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 100%;
  --accent: 0 0% 20%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 100% 60%;
  --destructive-foreground: 0 0% 0%;
  --border: 0 0% 100%;
  --input: 0 0% 100%;
  --ring: 0 0% 100%;
}

.high-contrast * {
  text-shadow: none !important;
  box-shadow: none !important;
}

.high-contrast a:focus,
.high-contrast button:focus,
.high-contrast input:focus,
.high-contrast select:focus,
.high-contrast textarea:focus,
.high-contrast [tabindex]:focus {
  outline: 3px solid currentColor !important;
  outline-offset: 2px !important;
}

.high-contrast img {
  filter: contrast(1.2);
}

.high-contrast .gradient-text {
  background: none !important;
  color: currentColor !important;
  -webkit-text-fill-color: currentColor !important;
}
`;