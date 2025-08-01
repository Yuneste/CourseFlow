import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set sample rates
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Filter sensitive data
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry Event (dev):', event);
      return null;
    }
    
    // Remove sensitive data from the event
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    
    if (event.user?.email) {
      // Hash email for privacy
      event.user.email = 'redacted';
    }
    
    // Remove any Stripe keys or tokens from the event
    const removeKeys = ['stripe', 'token', 'key', 'secret', 'password'];
    
    const sanitize = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      Object.keys(obj).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (removeKeys.some(k => lowerKey.includes(k))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      });
    };
    
    sanitize(event.extra);
    sanitize(event.contexts);
    sanitize(event.tags);
    
    return event;
  },
  
  // Disable in development
  enabled: process.env.NODE_ENV === 'production',
});