'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  FileX, 
  FolderOpen, 
  Search, 
  Inbox, 
  Cloud,
  Users,
  Calendar,
  MessageSquare,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  animate?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  animate = true
}: EmptyStateProps) {
  return (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.5 }}
    >
      {icon && (
        <motion.div
          className="mb-4"
          initial={animate ? { scale: 0 } : false}
          animate={animate ? { scale: 1 } : false}
          transition={{ delay: 0.2, type: 'spring', damping: 15 }}
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            {icon}
          </div>
        </motion.div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              className="min-w-[120px]"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="ghost"
              className="text-sm"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Pre-configured empty states
export const EmptyStates = {
  NoFiles: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<FileX className="w-8 h-8 text-gray-400" />}
      title="No files yet"
      description="Upload your first file to get started with organizing your academic materials."
      action={{
        label: "Upload File",
        onClick: () => {},
        variant: "default"
      }}
      {...props}
    />
  ),

  NoSearchResults: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<Search className="w-8 h-8 text-gray-400" />}
      title="No results found"
      description="Try adjusting your search terms or filters to find what you're looking for."
      action={{
        label: "Clear Search",
        onClick: () => {},
        variant: "outline"
      }}
      {...props}
    />
  ),

  NoCourses: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<FolderOpen className="w-8 h-8 text-gray-400" />}
      title="No courses yet"
      description="Create your first course to start organizing your academic materials."
      action={{
        label: "Create Course",
        onClick: () => {},
        variant: "default"
      }}
      {...props}
    />
  ),

  NoNotifications: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<Inbox className="w-8 h-8 text-gray-400" />}
      title="All caught up!"
      description="You have no new notifications at the moment."
      {...props}
    />
  ),

  NoInternet: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<Cloud className="w-8 h-8 text-gray-400" />}
      title="No internet connection"
      description="Please check your connection and try again."
      action={{
        label: "Retry",
        onClick: () => window.location.reload(),
        variant: "default"
      }}
      {...props}
    />
  ),

  NoTeamMembers: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<Users className="w-8 h-8 text-gray-400" />}
      title="No team members"
      description="Invite classmates to collaborate on this course."
      action={{
        label: "Invite Members",
        onClick: () => {},
        variant: "default"
      }}
      {...props}
    />
  ),

  NoEvents: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<Calendar className="w-8 h-8 text-gray-400" />}
      title="No upcoming events"
      description="Your calendar is clear. Add important dates and deadlines."
      action={{
        label: "Add Event",
        onClick: () => {},
        variant: "default"
      }}
      {...props}
    />
  ),

  NoComments: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<MessageSquare className="w-8 h-8 text-gray-400" />}
      title="No comments yet"
      description="Be the first to start the conversation."
      action={{
        label: "Add Comment",
        onClick: () => {},
        variant: "default"
      }}
      {...props}
    />
  ),

  Error: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<AlertCircle className="w-8 h-8 text-red-400" />}
      title="Something went wrong"
      description="We encountered an error while loading this content."
      action={{
        label: "Try Again",
        onClick: () => window.location.reload(),
        variant: "default"
      }}
      secondaryAction={{
        label: "Go Back",
        onClick: () => window.history.back()
      }}
      {...props}
    />
  ),

  ComingSoon: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FA8072] to-[#FF6B6B] rounded-lg opacity-20" />
          <Plus className="w-8 h-8 text-gray-400 absolute inset-0" />
        </div>
      }
      title="Coming Soon"
      description="This feature is under development and will be available soon."
      {...props}
    />
  )
};

// Illustrated empty state component
interface IllustratedEmptyStateProps extends EmptyStateProps {
  illustration?: 'files' | 'search' | 'error' | 'success';
}

export function IllustratedEmptyState({
  illustration = 'files',
  ...props
}: IllustratedEmptyStateProps) {
  const illustrations = {
    files: (
      <svg
        className="w-48 h-48 text-gray-400"
        fill="none"
        viewBox="0 0 200 200"
      >
        <rect x="50" y="50" width="100" height="120" rx="8" stroke="currentColor" strokeWidth="2" />
        <path d="M50 70h100M70 90h60M70 110h60M70 130h40" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    search: (
      <svg
        className="w-48 h-48 text-gray-400"
        fill="none"
        viewBox="0 0 200 200"
      >
        <circle cx="85" cy="85" r="50" stroke="currentColor" strokeWidth="2" />
        <path d="M120 120l30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    error: (
      <svg
        className="w-48 h-48 text-gray-400"
        fill="none"
        viewBox="0 0 200 200"
      >
        <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="2" />
        <path d="M100 60v40M100 120v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    success: (
      <svg
        className="w-48 h-48 text-gray-400"
        fill="none"
        viewBox="0 0 200 200"
      >
        <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="2" />
        <path d="M70 100l20 20 40-40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  };

  return (
    <EmptyState
      {...props}
      icon={illustrations[illustration]}
    />
  );
}