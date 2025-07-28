'use client';

import { useEffect, useState } from 'react';
import { Save, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatFileSize } from '@/lib/utils/file-validation';

interface DeduplicationStats {
  totalSaved: number;
  duplicatesPreventedCount: number;
  lastMonthSaved: number;
  topDuplicates: Array<{
    fileName: string;
    count: number;
    spaceSaved: number;
  }>;
}

export function DeduplicationStats() {
  const [stats, setStats] = useState<DeduplicationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeduplicationStats();
  }, []);

  const fetchDeduplicationStats = async () => {
    try {
      const response = await fetch('/api/files/deduplication-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch deduplication stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Store space saved in localStorage for quick access
  const saveSpaceSaved = (bytes: number) => {
    const key = 'courseflow_dedup_stats';
    const existing = localStorage.getItem(key);
    const stats = existing ? JSON.parse(existing) : { total: 0, count: 0, byMonth: {} };
    
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    stats.total += bytes;
    stats.count += 1;
    stats.byMonth[currentMonth] = (stats.byMonth[currentMonth] || 0) + bytes;
    
    localStorage.setItem(key, JSON.stringify(stats));
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Save className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold">Space Saved</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Saved</p>
          <p className="text-2xl font-bold text-green-600">
            {formatFileSize(stats.totalSaved)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Duplicates Prevented</p>
          <p className="text-2xl font-bold">{stats.duplicatesPreventedCount}</p>
        </div>
      </div>

      {stats.lastMonthSaved > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span>
            {formatFileSize(stats.lastMonthSaved)} saved this month
          </span>
        </div>
      )}

      {stats.topDuplicates.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Most Duplicated Files</h4>
          <div className="space-y-2">
            {stats.topDuplicates.slice(0, 3).map((file, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="truncate flex-1">{file.fileName}</span>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{file.count}x</span>
                  <span className="text-green-600">
                    {formatFileSize(file.spaceSaved)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export function DuplicateFileWarning({ 
  existingFile,
  onUseDuplicate,
  onUploadAnyway,
  spaceToBeSaved
}: {
  existingFile: any;
  onUseDuplicate: () => void;
  onUploadAnyway: () => void;
  spaceToBeSaved: number;
}) {
  return (
    <Card className="p-4 border-yellow-200 bg-yellow-50">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-yellow-900 mb-1">Duplicate File Detected</h4>
          <p className="text-sm text-yellow-800 mb-3">
            This file already exists in your library. Using the existing file will save {formatFileSize(spaceToBeSaved)}.
          </p>
          
          <div className="bg-white rounded p-2 mb-3">
            <p className="text-sm font-medium">{existingFile.display_name}</p>
            <p className="text-xs text-muted-foreground">
              Uploaded {new Date(existingFile.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onUseDuplicate}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Use Existing File
            </button>
            <button
              onClick={onUploadAnyway}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Upload Anyway
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}