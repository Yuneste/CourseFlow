'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HardDrive, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { formatFileSize, FILE_SIZE_LIMITS } from '@/lib/utils/file-validation';

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

  const getUsageColor = () => {
    if (usage.percentage >= 90) return 'text-red-600';
    if (usage.percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = () => {
    if (usage.percentage >= 90) return 'bg-red-600';
    if (usage.percentage >= 75) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <HardDrive className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">Storage Usage</h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Used</span>
          <span className={getUsageColor()}>
            {formatFileSize(usage.used)} / {formatFileSize(usage.total)}
          </span>
        </div>

        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full w-full flex-1 transition-all ${getProgressColor()}`}
            style={{ transform: `translateX(-${100 - usage.percentage}%)` }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{usage.percentage.toFixed(1)}% used</span>
          <span>{formatFileSize(usage.total - usage.used)} remaining</span>
        </div>

        {usage.percentage >= 90 && (
          <div className="flex items-start gap-2 mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="text-xs text-red-600 dark:text-red-400">
              <p className="font-medium">Storage almost full!</p>
              <p>Consider deleting old files or upgrading your plan.</p>
            </div>
          </div>
        )}

        {usage.percentage >= 75 && usage.percentage < 90 && (
          <div className="flex items-start gap-2 mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-xs text-yellow-600 dark:text-yellow-400">
              <p>You&apos;re using {usage.percentage.toFixed(0)}% of your storage.</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Plan: {userTier.charAt(0).toUpperCase() + userTier.slice(1)}</span>
          <span>{files.length} files</span>
        </div>
      </div>
    </Card>
  );
}