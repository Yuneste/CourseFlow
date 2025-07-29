export async function register() {
  // Initialize graceful shutdown handling
  await import('@/lib/graceful-shutdown')
  
  // Only run instrumentation in production
  if (process.env.NODE_ENV === 'production') {
    // Web Vitals reporting
    if (typeof window !== 'undefined') {
      const { reportWebVitals } = await import('@/lib/performance')
      const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import('web-vitals')
      
      onCLS(reportWebVitals)
      onFCP(reportWebVitals)
      onINP(reportWebVitals)
      onLCP(reportWebVitals)
      onTTFB(reportWebVitals)
    }
  }
}