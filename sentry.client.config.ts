import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set sample rates
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
      maskAllInputs: true,
    }),
    Sentry.browserTracingIntegration(),
  ],
  
  // Filter out non-critical errors
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry Event (dev):', event);
      return null;
    }
    
    // Filter out known non-critical errors
    const error = hint.originalException;
    
    // Filter out network errors that are expected
    if (error && error instanceof Error) {
      if (error.message.includes('Network request failed')) {
        return null;
      }
      if (error.message.includes('Load failed')) {
        return null;
      }
    }
    
    // Filter out specific error codes
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null;
    }
    
    return event;
  },
  
  // Disable in development
  enabled: process.env.NODE_ENV === 'production',
});