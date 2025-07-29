'use client';

import { Skeleton } from './skeleton';
import { Card } from './card';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function CourseCardSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-x-0 top-0 h-1 bg-gray-200" />
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

export function FileCardSkeleton({ className }: SkeletonProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header skeleton */}
      <div className="text-center mb-12">
        <Skeleton className="h-12 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-48 mx-auto" />
      </div>

      {/* Stats skeleton */}
      <div className="flex flex-wrap gap-4 justify-center">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 w-48">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Courses section skeleton */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <aside className="fixed top-0 left-0 z-40 h-full w-[280px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>

        {/* User section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="w-5 h-5" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 mb-1">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          {[1, 2, 3, 4].map((j) => (
            <Skeleton key={j} className="h-4 w-24" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  );
}