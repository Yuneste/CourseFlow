/**
 * Central export file for all components
 * Organized by category for better maintainability
 */

// Layout Components
export { Header } from './layout/Header';
export { Sidebar } from './layout/Sidebar';
export { MobileNav } from './layout/MobileNav';
export { NavigationBar } from './layout/NavigationBar';
export { ResponsiveLayout } from './layout/ResponsiveLayout';

// Auth Components
export { LogoutButton } from './auth/LogoutButton';

// Course Components
export { CourseCard } from './features/courses/CourseCard';
export { CourseForm } from './features/courses/CourseForm';
export { CourseList } from './features/courses/CourseList';
export { CourseListSkeleton } from './features/courses/CourseListSkeleton';
export { CountrySelector } from './features/courses/CountrySelector';

// File Components
export { FileCard } from './features/files/FileCard';
export { FileCardDraggable } from './features/files/FileCardDraggable';
export { FileCategoryView } from './features/files/FileCategoryView';
export { FileList } from './features/files/FileList';
export { FileListView } from './features/files/FileListView';
export { FilePreview } from './features/files/FilePreview';
export { FileUpload } from './features/files/FileUpload';
export { StorageUsage } from './features/files/StorageUsage';
export { UploadProgress } from './features/files/UploadProgress';
export { UploadStats } from './features/files/UploadStats';
export { DeduplicationStats } from './features/files/DeduplicationStats';

// Error Boundaries
export { GlobalErrorBoundary } from './error-boundaries/GlobalErrorBoundary';
export { AIProcessingErrorBoundary } from './error-boundaries/AIProcessingErrorBoundary';
export { FileUploadErrorBoundary } from './error-boundaries/FileUploadErrorBoundary';
export { PaymentErrorBoundary } from './error-boundaries/PaymentErrorBoundary';

// Feedback Components
export { EmptyStates } from './feedback/EmptyStates';
export { ConfirmationDialog } from './feedback/ConfirmationDialog';
export { ValidationMessage } from './feedback/FormValidation';
export { useNetworkStatus, NetworkStatusIndicator } from './feedback/NetworkStatus';
export { LinearProgress, CircularProgress, StepProgress, InfiniteProgress } from './feedback/ProgressIndicators';
export { CheckmarkAnimation, ConfettiEffect, TrophyAnimation, SparkleEffect, SuccessToast, CelebrationModal } from './feedback/SuccessAnimations';

// Accessibility Components
// export { AccessibleForm } from './accessibility/AccessibleForm';
// export { AccessibleNotification } from './accessibility/AccessibleNotification';
// export { AccessibleWrapper } from './accessibility/AccessibleWrapper';
// export { Announcements } from './accessibility/Announcements';
// export { AriaLiveRegion } from './accessibility/AriaLiveRegion';
// export { FocusManager } from './accessibility/FocusManager';
// export { FocusTrap } from './accessibility/FocusTrap';
// export { HighContrastMode } from './accessibility/HighContrastMode';
// export { KeyboardNavigableList } from './accessibility/KeyboardNavigableList';
// export { KeyboardNavigation } from './accessibility/KeyboardNavigation';
// export { KeyboardShortcutsDialog } from './accessibility/KeyboardShortcutsDialog';
export { SkipLinks } from './accessibility/SkipLinks';

// Performance Components
// export { CodeSplitBoundary } from './performance/CodeSplitBoundary';
// export { LazyComponents } from './performance/LazyComponents';
// export { LazyImage } from './performance/LazyImage';
// export { OptimisticUpdate } from './performance/OptimisticUpdate';
// export { PerformanceMonitor } from './performance/PerformanceMonitor';
// export { Prefetch } from './performance/Prefetch';
// export { VirtualList } from './performance/VirtualList';

// Security Components
export { PasswordStrength } from './security/PasswordStrength';
export { SecurityStatus } from './security/SecurityStatus';
export { SessionTimeout } from './security/SessionTimeout';

// SEO Components
export { MetaTags } from './seo/MetaTags';
export { OpenGraph } from './seo/OpenGraph';
export { SEOHead } from './seo/SEOHead';
export { Sitemap } from './seo/Sitemap';
export { StructuredData } from './seo/StructuredData';

// Provider Components
export { ThemeProvider } from './providers/ThemeProvider';
export { PageTransition } from './providers/PageTransition';

// Modal Components
export { KeyboardShortcutsModal } from './modals/KeyboardShortcutsModal';
export { SearchModal } from './search/SearchModal';

// Profile Components
export { ProfileDropdown } from './features/profile/ProfileDropdown';

// Onboarding Components
export { BenefitsShowcase } from './features/onboarding/BenefitsShowcase';
export { BenefitsShowcaseAnimated } from './features/onboarding/BenefitsShowcaseAnimated';

// UI Components (following shadcn/ui naming convention)
export * from './ui/alert';
export * from './ui/alert-dialog';
export * from './ui/avatar';
export * from './ui/badge';
export * from './ui/button';
export * from './ui/card';
export * from './ui/checkbox';
export * from './ui/dialog';
export * from './ui/dropdown-menu';
export * from './ui/form';
export * from './ui/input';
export * from './ui/label';
export * from './ui/link';
export * from './ui/popover';
export * from './ui/progress';
export * from './ui/radio-group';
export * from './ui/scroll-area';
export * from './ui/select';
export * from './ui/separator';
export * from './ui/sheet';
export * from './ui/skeleton';
export * from './ui/switch';
export * from './ui/tabs';
export * from './ui/textarea';
export * from './ui/tooltip';
export * from './ui/toast';
export * from './ui/toaster';
export { useToast } from './ui/use-toast';

// Unified UI Components
export { UnifiedBackground, UnifiedSection } from './ui/unified-background';
export { LoadingSpinner } from './ui/loading-spinner';
export { LoadingState } from './ui/LoadingState';
export { PageSkeleton } from './ui/page-skeleton';
export { OptimizedImage } from './ui/optimized-image';
export { ThemeToggle } from './ui/theme-toggle';

// Responsive Components
export { ResponsiveContainer } from './ui/responsive-container';
export { ResponsiveForm } from './ui/responsive-form';
export { ResponsiveGrid } from './ui/responsive-grid';
export { ResponsiveTable } from './ui/responsive-table';

// Monitoring Components
// export { AnalyticsHooks } from './monitoring/AnalyticsHooks';
// export { ErrorTracking } from './monitoring/ErrorTracking';
// export { PerformanceMonitoring } from './monitoring/PerformanceMonitoring';
// export { SentryIntegration } from './monitoring/SentryIntegration';
// export { UserFeedbackCollector } from './monitoring/UserFeedbackCollector';