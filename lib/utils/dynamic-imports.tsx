import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Loading component for dynamic imports
export const LoadingFallback = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-pulse">
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
};

// Dynamic import helper with loading state
export function dynamicImport<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    loading?: () => JSX.Element;
    ssr?: boolean;
  }
) {
  return dynamic(importFunc, {
    loading: options?.loading || LoadingFallback,
    ssr: options?.ssr ?? true,
  });
}

// Pre-configured dynamic imports for heavy components
export const DynamicBenefitsShowcase = dynamic(
  () => import('@/components/features/onboarding/BenefitsShowcaseAnimated').then(mod => ({ default: mod.BenefitsShowcaseAnimated })),
  { 
    loading: LoadingFallback,
    ssr: false // Benefits showcase doesn't need SSR
  }
);

export const DynamicFileUpload = dynamic(
  () => import('@/components/features/files/FileUpload').then(mod => ({ default: mod.FileUpload })),
  { loading: LoadingFallback }
);

export const DynamicCourseForm = dynamic(
  () => import('@/components/features/courses/CourseForm').then(mod => ({ default: mod.CourseForm })),
  { loading: LoadingFallback }
);