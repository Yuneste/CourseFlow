'use client';

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { 
  Upload, 
  Folder, 
  X, 
  AlertCircle, 
  File, 
  CheckCircle2, 
  Sparkles,
  Cloud,
  FileText,
  Image,
  Video,
  Music,
  Archive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { filesService } from '@/lib/services/files.service';
import { useAppStore } from '@/stores/useAppStore';
import { 
  validateFileType, 
  validateFileSize, 
  validateFileBatch,
  formatFileSize 
} from '@/lib/utils/file-validation';
import type { UploadProgress as UploadProgressType, File as FileType } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface FileUploadProps {
  courseId?: string;
  folderId?: string;
  onUploadComplete?: () => void;
  onUploadStart?: () => void;
}

// Get file icon based on type
const getFileTypeIcon = (file: File) => {
  const type = file.type.toLowerCase();
  if (type.includes('image')) return Image;
  if (type.includes('video')) return Video;
  if (type.includes('audio')) return Music;
  if (type.includes('zip') || type.includes('rar')) return Archive;
  if (type.includes('pdf') || type.includes('doc')) return FileText;
  return File;
};

// Get file type color
const getFileTypeColor = (file: File) => {
  const type = file.type.toLowerCase();
  if (type.includes('image')) return 'text-blue-600 bg-blue-100';
  if (type.includes('video')) return 'text-purple-600 bg-purple-100';
  if (type.includes('audio')) return 'text-pink-600 bg-pink-100';
  if (type.includes('zip') || type.includes('rar')) return 'text-yellow-600 bg-yellow-100';
  if (type.includes('pdf')) return 'text-red-600 bg-red-100';
  return 'text-gray-600 bg-gray-100';
};

export function FileUpload({ courseId, folderId, onUploadComplete, onUploadStart }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicateFiles, setDuplicateFiles] = useState<Map<string, any>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

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
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if we're leaving the drop zone entirely
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
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
      toast.error(batchValidation.error!);
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
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }
    
    // Check for duplicates
    if (validFiles.length > 0) {
      setCheckingDuplicates(true);
      try {
        const duplicateCheckResults = await Promise.all(
          validFiles.map(file => filesService.checkDuplicate(file, courseId))
        );
        
        const duplicatesMap = new Map<string, any>();
        duplicateCheckResults.forEach((result, index) => {
          if (result.isDuplicate) {
            duplicatesMap.set(validFiles[index].name, result.existingFile);
          }
        });
        
        setDuplicateFiles(duplicatesMap);
        setSelectedFiles(validFiles);
      } catch (error) {
        console.error('Error checking duplicates:', error);
        setSelectedFiles(validFiles);
      } finally {
        setCheckingDuplicates(false);
      }
    }
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName));
    setDuplicateFiles(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileName);
      return newMap;
    });
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    onUploadStart?.();

    // Add files to upload queue
    selectedFiles.forEach(file => {
      addToUploadQueue({
        id: file.name,
        filename: file.name,
        progress: 0,
        status: 'pending',
        error: null
      });
    });

    let successCount = 0;
    let errorCount = 0;

    for (const file of selectedFiles) {
      try {
        updateUploadProgress(file.name, 0, 'uploading');
        
        const uploadedFile = await filesService.uploadFile(
          file,
          courseId,
          folderId,
          (progress) => {
            updateUploadProgress(file.name, progress, 'uploading');
          }
        );

        updateUploadProgress(file.name, 100, 'completed');
        addFile(uploadedFile);
        successCount++;
        
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        updateUploadProgress(
          file.name, 
          0, 
          'error', 
          error instanceof Error ? error.message : 'Upload failed'
        );
        errorCount++;
        
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setIsUploading(false);
    setSelectedFiles([]);
    setDuplicateFiles(new Map());
    
    // Clear upload queue after a delay
    setTimeout(() => {
      clearUploadQueue();
    }, 3000);

    if (successCount > 0) {
      onUploadComplete?.();
    }

    // Show summary
    if (successCount > 0 && errorCount === 0) {
      toast.success(`All ${successCount} files uploaded successfully!`);
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(`${successCount} files uploaded, ${errorCount} failed`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300",
          isDragging 
            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20" 
            : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600",
          "group"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 40% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)`
          }} />
        </div>

        <div className="relative text-center">
          <motion.div
            animate={{
              y: isDragging ? -10 : 0,
              scale: isDragging ? 1.1 : 1
            }}
            transition={{ type: "spring", stiffness: 300 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 mb-4 mx-auto"
          >
            <Cloud className={cn(
              "h-10 w-10 transition-colors",
              isDragging ? "text-indigo-600" : "text-gray-400"
            )} />
          </motion.div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {isDragging ? "Drop your files here" : "Upload course materials"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Drag and drop files here, or click to browse
          </p>

          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
            <Button
              variant="outline"
              onClick={() => folderInputRef.current?.click()}
              disabled={isUploading}
            >
              <Folder className="h-4 w-4 mr-2" />
              Upload Folder
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip,.rar"
          />
          <input
            ref={folderInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            {...{ webkitdirectory: "", directory: "" } as any}
          />

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
            <span>Max file size: 50MB</span>
            <span>•</span>
            <span>Supports PDF, DOC, PPT, images, and more</span>
          </div>
        </div>
      </div>

      {/* Selected Files */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Selected Files ({selectedFiles.length})
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFiles([]);
                  setDuplicateFiles(new Map());
                }}
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedFiles.map((file) => {
                const Icon = getFileTypeIcon(file);
                const isDuplicate = duplicateFiles.has(file.name);
                
                return (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border",
                      isDuplicate 
                        ? "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20" 
                        : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", getFileTypeColor(file))}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </span>
                        {isDuplicate && (
                          <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Duplicate
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.name)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {duplicateFiles.size > 0 && (
                  <span className="text-yellow-600 dark:text-yellow-500">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    {duplicateFiles.size} duplicate file{duplicateFiles.size > 1 ? 's' : ''} will be replaced
                  </span>
                )}
              </div>
              
              <Button
                onClick={uploadFiles}
                disabled={isUploading || checkingDuplicates}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                {isUploading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : checkingDuplicates ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Upload Progress
            </h4>
            
            {uploadQueue.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.filename}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.status === 'completed' && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    {item.status === 'uploading' && `${item.progress}%`}
                  </span>
                </div>
                
                <Progress 
                  value={item.progress} 
                  className={cn(
                    "h-1.5",
                    item.status === 'completed' && "bg-green-100",
                    item.status === 'error' && "bg-red-100"
                  )}
                />
                
                {item.error && (
                  <p className="text-xs text-red-600 mt-1">{item.error}</p>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Messages */}
      <AnimatePresence>
        {uploadErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-red-900 dark:text-red-100">
                  Upload Errors
                </p>
                {uploadErrors.map((error, index) => (
                  <p key={index} className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}