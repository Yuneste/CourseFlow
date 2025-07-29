'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearOnUnmount?: boolean;
  className?: string;
}

export function Announcement({ 
  message, 
  priority = 'polite',
  clearOnUnmount = true,
  className 
}: AnnouncementProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (element && message) {
      element.textContent = message;
    }

    return () => {
      if (clearOnUnmount && element) {
        element.textContent = '';
      }
    };
  }, [message, clearOnUnmount]);

  return (
    <div
      ref={ref}
      aria-live={priority}
      aria-atomic="true"
      className={cn('sr-only', className)}
    />
  );
}

// Hook for announcing messages to screen readers
export function useAnnouncement() {
  const announcementRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority);
      announcementRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  const AnnouncementContainer = () => (
    <div
      ref={announcementRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );

  return { announce, AnnouncementContainer };
}