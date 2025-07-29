// Route-level code splitting configuration
// This is an example configuration for implementing code splitting in your routes

// Example of how to configure routes with code splitting:
export const routes = {
  // Main dashboard - loaded eagerly as it's the primary route
  dashboard: {
    path: '/dashboard',
    eager: true
  },
  
  // Dashboard sub-routes - lazy loaded
  dashboardAnalytics: {
    path: '/dashboard/analytics',
    preload: true // Preload when hovering over link
  },
  
  dashboardStats: {
    path: '/dashboard/stats',
    preload: true
  },
  
  dashboardNotifications: {
    path: '/dashboard/notifications',
    preload: false // Load on demand
  },
  
  dashboardSearch: {
    path: '/dashboard/search',
    preload: false
  },
  
  // Course routes
  courseDetail: {
    path: '/courses/[id]',
    preload: true
  },
  
  courseSettings: {
    path: '/courses/[id]/settings',
    preload: false
  },
  
  // Settings routes
  settings: {
    profile: { path: '/settings/profile', preload: false },
    privacy: { path: '/settings/privacy', preload: false },
    country: { path: '/settings/country', preload: false }
  },
  
  // Onboarding - important but not critical for initial load
  onboarding: {
    path: '/onboarding',
    preload: false
  }
}

// Example of how to use dynamic imports with actual routes:
// import { dynamicRoute } from '@/lib/utils/code-splitting'
// 
// export const lazyRoutes = {
//   dashboardAnalytics: dynamicRoute(() => import('@/app/dashboard/analytics/page')),
//   dashboardStats: dynamicRoute(() => import('@/app/dashboard/stats/page')),
//   // ... etc
// }

// Route groups for prefetching strategies
export const routeGroups = {
  // Critical routes - preload immediately after main bundle
  critical: [
    '/dashboard',
    '/dashboard/courses/[courseId]'
  ],
  
  // Secondary routes - preload on idle
  secondary: [
    '/dashboard/analytics',
    '/dashboard/stats',
    '/courses/[id]'
  ],
  
  // On-demand routes - only load when needed
  onDemand: [
    '/dashboard/notifications',
    '/dashboard/search',
    '/settings/*',
    '/onboarding'
  ]
}

// Prefetch configuration
export const prefetchConfig = {
  // Prefetch on hover
  onHover: [
    '/dashboard/analytics',
    '/dashboard/stats',
    '/courses/*'
  ],
  
  // Prefetch on viewport entry
  onViewport: [
    '/dashboard/courses/*'
  ],
  
  // Prefetch after delay
  afterDelay: {
    routes: ['/settings/profile', '/settings/privacy'],
    delay: 5000 // 5 seconds after page load
  }
}

// Component splitting within routes
export const componentSplitting = {
  // Heavy components to split out
  heavy: [
    'PDFViewer',
    'CourseEditor',
    'AnalyticsChart',
    'AIChat'
  ],
  
  // Modal components to split
  modals: [
    'FileUploadModal',
    'CourseCreationWizard',
    'PaymentModal',
    'ShareModal'
  ],
  
  // Features to split by usage
  features: {
    ai: ['AIChat', 'AIAnalysis', 'SmartSuggestions'],
    analytics: ['ProgressChart', 'UsageStats', 'PerformanceMetrics'],
    collaboration: ['ShareModal', 'CommentSystem', 'RealTimeSync']
  }
}

// Webpack chunk names for better debugging
export const chunkNames = {
  routes: {
    dashboard: 'dashboard-main',
    analytics: 'dashboard-analytics',
    courses: 'courses',
    settings: 'settings',
    onboarding: 'onboarding'
  },
  features: {
    ai: 'feature-ai',
    upload: 'feature-upload',
    editor: 'feature-editor',
    charts: 'feature-charts'
  },
  vendors: {
    pdfjs: 'vendor-pdfjs',
    recharts: 'vendor-recharts',
    dnd: 'vendor-dnd'
  }
}