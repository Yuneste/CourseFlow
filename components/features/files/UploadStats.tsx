'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart3, FileUp, FileX, Clock } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { formatFileSize } from '@/lib/utils/file-validation';

interface FileStats {
  totalFiles: number;
  totalSize: number;
  byType: Record<string, { count: number; size: number }>;
  recentUploads: number;
  lastUploadDate: Date | null;
}

export function UploadStats() {
  const { files } = useAppStore();
  const [stats, setStats] = useState<FileStats>({
    totalFiles: 0,
    totalSize: 0,
    byType: {},
    recentUploads: 0,
    lastUploadDate: null,
  });

  useEffect(() => {
    const calculateStats = () => {
      const byType: Record<string, { count: number; size: number }> = {};
      let totalSize = 0;
      let lastUpload: Date | null = null;
      let recentCount = 0;
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      files.forEach(file => {
        totalSize += file.file_size;
        
        // Group by file type category
        const category = getFileCategory(file.file_type);
        if (!byType[category]) {
          byType[category] = { count: 0, size: 0 };
        }
        byType[category].count++;
        byType[category].size += file.file_size;

        // Track recent uploads (last 24 hours)
        const uploadDate = new Date(file.created_at);
        if (uploadDate > oneDayAgo) {
          recentCount++;
        }

        // Find most recent upload
        if (!lastUpload || uploadDate > lastUpload) {
          lastUpload = uploadDate;
        }
      });

      setStats({
        totalFiles: files.length,
        totalSize,
        byType,
        recentUploads: recentCount,
        lastUploadDate: lastUpload,
      });
    };

    calculateStats();
  }, [files]);

  const getFileCategory = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('image')) return 'Images';
    if (mimeType.includes('document') || mimeType.includes('msword')) return 'Documents';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Spreadsheets';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Presentations';
    if (mimeType.includes('text')) return 'Text';
    return 'Other';
  };

  const getTopFileTypes = () => {
    return Object.entries(stats.byType)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">Upload Statistics</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileUp className="h-4 w-4" />
            <span className="text-sm">Total Files</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalFiles}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(stats.totalSize)} total
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Recent</span>
          </div>
          <p className="text-2xl font-bold">{stats.recentUploads}</p>
          <p className="text-xs text-muted-foreground">
            Last 24 hours
          </p>
        </div>
      </div>

      {stats.totalFiles > 0 && (
        <>
          <div className="mt-4 pt-3 border-t">
            <h4 className="text-sm font-medium mb-2">File Types</h4>
            <div className="space-y-2">
              {getTopFileTypes().map(([type, data]) => (
                <div key={type} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{type}</span>
                  <div className="text-right">
                    <span className="font-medium">{data.count}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({formatFileSize(data.size)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {stats.lastUploadDate && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                Last upload: {stats.lastUploadDate.toLocaleString()}
              </p>
            </div>
          )}
        </>
      )}

      {stats.totalFiles === 0 && (
        <div className="mt-4 text-center py-4">
          <FileX className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No files uploaded yet</p>
        </div>
      )}
    </Card>
  );
}