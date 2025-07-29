'use client';

import { useRef, useState, useEffect, DragEvent, ChangeEvent } from 'react';
import { Upload, Folder, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatFileSize } from '@/lib/utils/file-validation';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAppStore } from '@/stores/useAppStore';
import { DELAYS, FILE_UPLOAD } from '@/lib/constants';
import type { File as FileType } from '@/types';

interface FileUploadProps {
  courseId?: string;
  folderId?: string;
  onUploadComplete?: () => void;
  onUploadStart?: () => void;
}

export function FileUpload({ courseId, folderId, onUploadComplete, onUploadStart }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const {
    selectedFiles,
    uploadErrors,
    isUploading,
    checkingDuplicates,
    duplicateFiles,
    uploadQueue,
    handleFileSelect,
    uploadFiles,
    removeSelectedFile,
    setUploadErrors,
  } = useFileUpload({
    courseId,
    folderId,
    onUploadComplete,
    onUploadStart,
  });

  const { removeFromUploadQueue } = useAppStore();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileSelect(files);
    }
  };


  // Auto-remove completed uploads after fade-out
  useEffect(() => {
    const completedUploads = uploadQueue.filter(u => u.status === 'completed');
    
    if (completedUploads.length > 0) {
      const timer = setTimeout(() => {
        completedUploads.forEach(u => removeFromUploadQueue(u.fileId));
      }, DELAYS.UPLOAD_COMPLETE_FADE);
      
      return () => clearTimeout(timer);
    }
  }, [uploadQueue, removeFromUploadQueue]);

  // Handle paste event for screenshots
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            // Create a proper filename for the pasted image
            const filename = `screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
            const file = new File([blob], filename, { type: blob.type });
            files.push(file);
          }
        }
      }

      if (files.length > 0) {
        handleFileSelect(files);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handleFileSelect]);

  return (
    <div className="space-y-4">
      {/* Drag and drop zone */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="p-8 text-center"
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">
            Drag and drop files here
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse files
          </p>
          
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Select Files
            </Button>
            
            <Button
              variant="outline"
              onClick={() => folderInputRef.current?.click()}
              disabled={isUploading}
            >
              <Folder className="mr-2 h-4 w-4" />
              Select Folder
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.webp"
          />
          
          <input
            ref={folderInputRef}
            type="file"
            // @ts-ignore - webkitdirectory is not in the types
            webkitdirectory=""
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />

          <p className="text-xs text-muted-foreground mt-4">
            Maximum file size: {formatFileSize(FILE_UPLOAD.MAX_SIZE)} | Supported formats: PDF, Word, PowerPoint, Images, Text, Spreadsheets
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            💡 Tip: You can also paste screenshots directly from clipboard (Ctrl+V)
          </p>
        </div>
      </Card>

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium mb-3">Selected Files ({selectedFiles.length})</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedFiles.map((file, index) => {
              const isDuplicate = duplicateFiles.has(file.name);
              const existingFile = duplicateFiles.get(file.name);
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex-1 truncate">
                      <span className="font-medium">{file.name}</span>
                      <span className="text-muted-foreground ml-2">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSelectedFile(index)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {isDuplicate && existingFile && (
                    <div className="ml-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-200">
                      <AlertCircle className="inline h-3 w-3 mr-1" />
                      Duplicate: This file already exists (uploaded {new Date(existingFile.created_at).toLocaleDateString()})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {checkingDuplicates && (
            <p className="text-sm text-muted-foreground mt-2">
              Checking for duplicates...
            </p>
          )}
          
          <Button
            className="w-full mt-4"
            onClick={uploadFiles}
            disabled={isUploading || selectedFiles.length === 0 || checkingDuplicates}
          >
            {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
          </Button>
        </Card>
      )}

      {/* Inline upload progress */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2">
          {uploadQueue.map((upload) => (
            <div 
              key={upload.fileId} 
              className={`rounded-lg p-3 transition-all duration-500 animate-in slide-in-from-top-2 ${
                upload.status === 'completed' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              } bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium truncate flex-1 text-gray-900 dark:text-gray-100">
                  {upload.fileName}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                  {upload.status === 'completed' ? '✓ Complete' : 
                   upload.status === 'failed' ? '✗ Failed' : 
                   `${Math.round(upload.progress)}%`}
                </span>
              </div>
              <Progress 
                value={upload.progress} 
                className="h-2 bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-full" 
                indicatorClassName={cn(
                  "transition-all duration-300 ease-out",
                  upload.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  upload.status === 'failed' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                  'bg-gradient-to-r from-blue-500 to-blue-600'
                )}
              />
              {upload.error && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{upload.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {uploadErrors.length > 0 && (
        <Card className="p-4 border-destructive/50 bg-destructive/5">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1 space-y-1">
              <h4 className="font-medium text-destructive">Upload Errors</h4>
              {uploadErrors.slice(0, 5).map((error, index) => (
                <p key={index} className="text-sm text-destructive/90">
                  {error}
                </p>
              ))}
              {uploadErrors.length > 5 && (
                <p className="text-sm text-destructive/70 italic">
                  ...and {uploadErrors.length - 5} more errors
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setUploadErrors([])}
              className="text-destructive hover:text-destructive/80 -mt-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}