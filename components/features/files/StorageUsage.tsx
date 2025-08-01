'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HardDrive, AlertCircle, TrendingUp, Sparkles } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { formatFileSize, FILE_SIZE_LIMITS } from '@/lib/utils/file-validation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StorageUsageProps {
  userTier?: 'free' | 'student' | 'premium';
}

export function StorageUsage({ userTier = 'free' }: StorageUsageProps) {
  const { getTotalStorageUsed, files } = useAppStore();
  const [usage, setUsage] = useState({ used: 0, total: 0, percentage: 0 });

  const storageLimit = FILE_SIZE_LIMITS.STORAGE_QUOTA[userTier];

  useEffect(() => {
    const usedBytes = getTotalStorageUsed();
    const percentage = (usedBytes / storageLimit) * 100;
    
    setUsage({
      used: usedBytes,
      total: storageLimit,
      percentage: Math.min(percentage, 100),
    });
  }, [files, getTotalStorageUsed, storageLimit]);

  const getUsageGradient = () => {
    if (usage.percentage >= 90) return 'from-red-500 to-orange-500';
    if (usage.percentage >= 75) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  const getUsageColor = () => {
    if (usage.percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (usage.percentage >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getPlanBadge = () => {
    switch (userTier) {
      case 'premium':
        return { 
          label: 'Premium', 
          className: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
        };
      case 'student':
        return { 
          label: 'Student', 
          className: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
        };
      default:
        return { 
          label: 'Free', 
          className: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' 
        };
    }
  };

  const planBadge = getPlanBadge();

  return (
    <Card className="overflow-hidden">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
              <HardDrive className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Storage</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {files.length} files stored
              </p>
            </div>
          </div>
          <span className={cn("px-3 py-1 rounded-full text-xs font-medium", planBadge.className)}>
            {planBadge.label}
          </span>
        </div>

        {/* Usage Display */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className={cn("text-2xl font-bold", getUsageColor())}>
                {formatFileSize(usage.used)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                / {formatFileSize(usage.total)}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {usage.percentage.toFixed(0)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full bg-gradient-to-r rounded-full",
                  getUsageGradient()
                )}
                initial={{ width: 0 }}
                animate={{ width: `${usage.percentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            {/* Animated Sparkle at the end of progress */}
            {usage.percentage > 0 && usage.percentage < 100 && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${usage.percentage}%` }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 -ml-2" />
              </motion.div>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(usage.total - usage.used)} remaining
          </p>
        </div>

        {/* Alerts */}
        {usage.percentage >= 90 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
          >
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-red-900 dark:text-red-100">
                Storage almost full!
              </p>
              <p className="text-red-700 dark:text-red-300 mt-0.5">
                Delete old files or upgrade to continue uploading.
              </p>
            </div>
          </motion.div>
        )}

        {usage.percentage >= 75 && usage.percentage < 90 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
          >
            <TrendingUp className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Storage usage is getting high
            </p>
          </motion.div>
        )}

        {/* Upgrade CTA for free users */}
        {userTier === 'free' && usage.percentage >= 50 && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
            <button className="w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
              Upgrade for more storage
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}