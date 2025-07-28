'use client';

import { useEffect } from 'react';
import { isMobileDevice } from '@/lib/utils/image-optimizer';

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
          
          // Check for updates every hour
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'UPLOAD_SUCCESS') {
          // Handle successful background upload
          console.log('Background upload successful:', event.data.data);
          
          // Show notification if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Upload Complete', {
              body: 'Your files have been uploaded successfully',
              icon: '/icon-192x192.png'
            });
          }
        }
      });
    }
    
    // Request notification permission on mobile
    if (isMobileDevice() && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  return <>{children}</>;
}