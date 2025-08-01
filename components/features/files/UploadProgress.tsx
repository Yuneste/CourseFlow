'use client';

import { useState, useEffect } from 'react';
import { X, Pause, Play, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/stores/useAppStore';
import { formatFileSize } from '@/lib/utils/file-validation';
import { motion, AnimatePresence } from 'framer-motion';
import type { UploadProgress as UploadProgressType } from '@/types';

interface UploadProgressProps {
  onClose?: () => void;
}

export function UploadProgress({ onClose }: UploadProgressProps) {
  const { uploadQueue, removeFromUploadQueue, updateUploadProgress } = useAppStore();
  const [pausedUploads, setPausedUploads] = useState<Set<string>>(new Set());

  // Auto-remove completed uploads after 2 seconds
  useEffect(() => {
    const completedUploads = uploadQueue.filter(u => u.status === 'completed');
    if (completedUploads.length > 0) {
      const timer = setTimeout(() => {
        completedUploads.forEach(u => removeFromUploadQueue(u.fileId));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [uploadQueue, removeFromUploadQueue]);

  const handlePause = (fileId: string) => {
    setPausedUploads(prev => new Set(prev).add(fileId));
    updateUploadProgress(fileId, { status: 'paused' });
    // In a real implementation, this would pause the actual upload
    // For now, we'll just update the UI state
  };

  const handleResume = (fileId: string) => {
    setPausedUploads(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileId);
      return newSet;
    });
    updateUploadProgress(fileId, { status: 'uploading' });
    // In a real implementation, this would resume the actual upload
    // For now, we'll just update the UI state
  };

  const handleCancel = (fileId: string) => {
    removeFromUploadQueue(fileId);
    // In a real implementation, this would also cancel the actual upload
  };

  const activeUploads = uploadQueue.filter(u => u.status === 'uploading' || u.status === 'paused');
  const completedUploads = uploadQueue.filter(u => u.status === 'completed');
  const failedUploads = uploadQueue.filter(u => u.status === 'failed');

  const totalProgress = uploadQueue.reduce((sum, upload) => sum + upload.progress, 0) / Math.max(uploadQueue.length, 1);

  return (
    <AnimatePresence>
      {uploadQueue.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-20 right-6 w-96 z-30"
        >
          <Card className="max-h-96 overflow-hidden shadow-lg">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Upload Progress</h3>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{activeUploads.length} active</span>
          {completedUploads.length > 0 && (
            <>
              <span>•</span>
              <span className="text-green-600">{completedUploads.length} completed</span>
            </>
          )}
          {failedUploads.length > 0 && (
            <>
              <span>•</span>
              <span className="text-red-600">{failedUploads.length} failed</span>
            </>
          )}
        </div>
        <Progress value={totalProgress} className="mt-2" />
      </div>

      <div className="max-h-72 overflow-y-auto">
        <AnimatePresence>
          {uploadQueue.map((upload) => (
            <motion.div
              key={upload.fileId}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-3 border-b last:border-b-0">
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{upload.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {upload.fileSize && formatFileSize(upload.fileSize)}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                {upload.status === 'uploading' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePause(upload.fileId)}
                    className="h-6 w-6"
                  >
                    <Pause className="h-3 w-3" />
                  </Button>
                )}
                {upload.status === 'paused' && pausedUploads.has(upload.fileId) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleResume(upload.fileId)}
                    className="h-6 w-6"
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                )}
                {(upload.status === 'uploading' || upload.status === 'paused') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCancel(upload.fileId)}
                    className="h-6 w-6"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                {upload.status === 'completed' && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                {upload.status === 'failed' && (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>

            {(upload.status === 'uploading' || upload.status === 'paused') && (
              <div className="mt-2">
                <Progress value={upload.progress} className="h-1" />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-muted-foreground">
                    {upload.status === 'paused' ? 'Paused' : `${Math.round(upload.progress)}%`}
                  </span>
                  {upload.uploadSpeed && upload.status === 'uploading' && (
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(upload.uploadSpeed)}/s
                    </span>
                  )}
                </div>
              </div>
            )}

            {upload.status === 'failed' && upload.error && (
              <p className="text-xs text-red-600 mt-1">{upload.error}</p>
            )}
          </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}