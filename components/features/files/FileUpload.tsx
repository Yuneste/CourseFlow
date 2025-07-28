'use client';

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { Upload, Folder, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { filesService } from '@/lib/services/files.service';
import { useAppStore } from '@/stores/useAppStore';
import { 
  validateFileType, 
  validateFileSize, 
  validateFileBatch,
  formatFileSize 
} from '@/lib/utils/file-validation';
import type { UploadProgress as UploadProgressType, File as FileType } from '@/types';

interface FileUploadProps {
  courseId?: string;
  folderId?: string;
  onUploadComplete?: () => void;
}

export function FileUpload({ courseId, folderId, onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicateFiles, setDuplicateFiles] = useState<Map<string, any>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const { 
    addFile, 
    uploadQueue, 
    addToUploadQueue, 
    updateUploadProgress, 
    removeFromUploadQueue,
    clearUploadQueue 
  } = useAppStore();

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
    handleFiles(files);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const errors: string[] = [];
    const validFiles: File[] = [];

    // Validate batch
    const batchValidation = validateFileBatch(files);
    if (!batchValidation.valid) {
      setUploadErrors([batchValidation.error!]);
      return;
    }

    // Validate individual files
    files.forEach(file => {
      const typeValidation = validateFileType(file);
      if (!typeValidation.valid) {
        errors.push(`${file.name}: ${typeValidation.error}`);
        return;
      }

      const sizeValidation = validateFileSize(file);
      if (!sizeValidation.valid) {
        errors.push(`${file.name}: ${sizeValidation.error}`);
        return;
      }

      validFiles.push(file);
    });

    setUploadErrors(errors);
    
    // Check for duplicates
    if (validFiles.length > 0) {
      setCheckingDuplicates(true);
      const duplicatesMap = new Map<string, any>();
      
      for (const file of validFiles) {
        try {
          const result = await filesService.checkDuplicate(file);
          if (result.isDuplicate && result.existingFile) {
            duplicatesMap.set(file.name, result.existingFile);
          }
        } catch (error) {
          console.error('Error checking duplicate:', error);
        }
      }
      
      setDuplicateFiles(duplicatesMap);
      setCheckingDuplicates(false);
    }
    
    setSelectedFiles(validFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadErrors([]);

    try {
      // Clear previous upload queue
      clearUploadQueue();

      // Upload files with progress tracking
      const result = await filesService.uploadWithQueue(selectedFiles, {
        courseId,
        folderId,
        onFileProgress: (fileId, progress) => {
          if (progress.status === 'uploading') {
            addToUploadQueue(progress);
          }
          updateUploadProgress(fileId, progress);
        },
      });

      // Add successful uploads to store
      result.files.forEach(file => addFile(file));

      // Show errors if any
      if (result.errors && result.errors.length > 0) {
        const errorMessages = result.errors.map(err => 
          `${err.filename}: ${err.error}`
        );
        setUploadErrors(errorMessages);
      }

      // Clear selected files if all successful
      if (!result.errors || result.errors.length === 0) {
        setSelectedFiles([]);
        onUploadComplete?.();
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadErrors([error instanceof Error ? error.message : 'Upload failed']);
    } finally {
      setIsUploading(false);
      // Clear completed uploads after a delay
      setTimeout(() => {
        uploadQueue
          .filter(u => u.status === 'completed')
          .forEach(u => removeFromUploadQueue(u.fileId));
      }, 3000);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

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
        handleFiles(files);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

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
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.webp"
          />
          
          <input
            ref={folderInputRef}
            type="file"
            // @ts-ignore - webkitdirectory is not in the types
            webkitdirectory=""
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <p className="text-xs text-muted-foreground mt-4">
            Maximum file size: 50MB | Supported formats: PDF, Word, PowerPoint, Images, Text, Spreadsheets
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
            onClick={handleUpload}
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
            <div key={upload.fileId} className="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium truncate flex-1">
                  {upload.fileName}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {upload.status === 'completed' ? '✓' : 
                   upload.status === 'failed' ? '✗' : 
                   `${Math.round(upload.progress)}%`}
                </span>
              </div>
              <Progress 
                value={upload.progress} 
                className="h-1" 
                indicatorClassName={
                  upload.status === 'completed' ? 'bg-green-500' :
                  upload.status === 'failed' ? 'bg-red-500' :
                  ''
                }
              />
              {upload.error && (
                <p className="text-xs text-destructive mt-1">{upload.error}</p>
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
            <div className="space-y-1">
              <h4 className="font-medium text-destructive">Upload Errors</h4>
              {uploadErrors.map((error, index) => (
                <p key={index} className="text-sm text-destructive/90">
                  {error}
                </p>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}