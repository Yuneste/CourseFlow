import { useState, useCallback } from 'react';
import { filesService } from '@/lib/services/files.service.client';
import { useAppStore } from '@/stores/useAppStore';
import { validateFileType, validateFileSize, validateFileBatch } from '@/lib/utils/file-validation';
import { logger } from '@/lib/services/logger.service';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants';
import type { File as FileType, UploadProgress } from '@/types';

interface UseFileUploadOptions {
  courseId?: string;
  folderId?: string;
  onUploadComplete?: () => void;
  onUploadStart?: () => void;
}

interface FileValidationResult {
  validFiles: File[];
  errors: string[];
}

interface DuplicateCheckResult {
  duplicates: Map<string, any>; // Using any since the API returns partial file info
  error?: string;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const { courseId, folderId, onUploadComplete, onUploadStart } = options;
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicateFiles, setDuplicateFiles] = useState<Map<string, any>>(new Map());

  const { 
    addFile, 
    uploadQueue, 
    addToUploadQueue, 
    updateUploadProgress, 
    removeFromUploadQueue,
    clearUploadQueue,
    clearCompletedUploads 
  } = useAppStore();

  // Validate a single file
  const validateFile = useCallback((file: File): string | null => {
    const typeValidation = validateFileType(file);
    if (!typeValidation.valid) {
      return `${file.name}: ${typeValidation.error}`;
    }

    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      return `${file.name}: ${sizeValidation.error}`;
    }

    return null;
  }, []);

  // Validate multiple files
  const validateFiles = useCallback((files: File[]): FileValidationResult => {
    const errors: string[] = [];
    const validFiles: File[] = [];

    // Check batch validation first
    const batchValidation = validateFileBatch(files);
    if (!batchValidation.valid) {
      return { validFiles: [], errors: [batchValidation.error!] };
    }

    // Validate individual files
    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    return { validFiles, errors };
  }, [validateFile]);

  // Check for duplicate files
  const checkForDuplicates = useCallback(async (files: File[]): Promise<DuplicateCheckResult> => {
    const duplicates = new Map<string, any>();
    
    try {
      await Promise.all(
        files.map(async (file) => {
          try {
            const result = await filesService.checkDuplicate(file, courseId);
            if (result.isDuplicate && result.existingFile) {
              duplicates.set(file.name, result.existingFile);
            }
          } catch (error) {
            logger.error('Error checking duplicate', error, { 
              action: 'checkDuplicate',
              metadata: { fileName: file.name, courseId }
            });
          }
        })
      );
      
      return { duplicates };
    } catch (error) {
      logger.error('Duplicate check failed', error);
      return { duplicates, error: 'Failed to check for duplicates' };
    }
  }, [courseId]);

  // Handle file selection
  const handleFileSelect = useCallback(async (files: File[]) => {
    // Reset errors
    setUploadErrors([]);

    // Validate files
    const { validFiles, errors } = validateFiles(files);
    
    if (errors.length > 0) {
      setUploadErrors(errors);
    }

    if (validFiles.length === 0) {
      setSelectedFiles([]);
      return;
    }

    // Check for duplicates
    setCheckingDuplicates(true);
    const { duplicates } = await checkForDuplicates(validFiles);
    setDuplicateFiles(duplicates);
    setCheckingDuplicates(false);

    setSelectedFiles(validFiles);
  }, [validateFiles, checkForDuplicates]);

  // Upload files
  const uploadFiles = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    // Filter out duplicate files
    const filesToUpload = selectedFiles.filter(file => !duplicateFiles.has(file.name));
    
    if (filesToUpload.length === 0) {
      setUploadErrors(['All selected files are duplicates in this course and have been skipped']);
      return;
    }

    // Show warning if some files were skipped
    if (filesToUpload.length < selectedFiles.length) {
      const skippedCount = selectedFiles.length - filesToUpload.length;
      setUploadErrors([`${skippedCount} duplicate file(s) in this course skipped`]);
    }

    setIsUploading(true);
    onUploadStart?.();

    try {
      // Clear previous upload queue
      clearUploadQueue();

      // Upload only non-duplicate files with progress tracking
      const result = await filesService.upload(filesToUpload, {
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
        // If some files were skipped due to duplicates, prepend that message
        if (filesToUpload.length < selectedFiles.length) {
          const skippedCount = selectedFiles.length - filesToUpload.length;
          errorMessages.unshift(`${skippedCount} duplicate file(s) in this course were skipped`);
        }
        setUploadErrors(errorMessages);
      }

      // Clear selected files and show success
      if (result.files.length > 0) {
        setSelectedFiles([]);
        // Clear completed uploads from the queue after a short delay to show completion
        setTimeout(() => {
          clearCompletedUploads();
        }, 1500);
        onUploadComplete?.();
        logger.info('Files uploaded successfully', {
          action: 'uploadFiles',
          metadata: { fileCount: result.files.length, skippedDuplicates: selectedFiles.length - filesToUpload.length }
        });
      } else if (result.errors && result.errors.length === filesToUpload.length) {
        // All non-duplicate files failed to upload
        logger.error('All files failed to upload', {
          action: 'uploadFiles',
          metadata: { attemptedCount: filesToUpload.length, errors: result.errors }
        });
      }

    } catch (error) {
      logger.error('Upload error', error, {
        action: 'uploadFiles',
        metadata: { fileCount: selectedFiles.length }
      });
      setUploadErrors([error instanceof Error ? error.message : ERROR_MESSAGES.UPLOAD_FAILED]);
    } finally {
      setIsUploading(false);
    }
  }, [
    selectedFiles, 
    duplicateFiles,
    courseId, 
    folderId, 
    onUploadStart, 
    onUploadComplete,
    clearUploadQueue,
    clearCompletedUploads,
    addToUploadQueue,
    updateUploadProgress,
    addFile
  ]);

  // Remove a selected file
  const removeSelectedFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Clear all selections and errors
  const clearSelection = useCallback(() => {
    setSelectedFiles([]);
    setUploadErrors([]);
    setDuplicateFiles(new Map());
  }, []);

  return {
    // State
    selectedFiles,
    uploadErrors,
    isUploading,
    checkingDuplicates,
    duplicateFiles,
    uploadQueue,
    
    // Actions
    handleFileSelect,
    uploadFiles,
    removeSelectedFile,
    clearSelection,
    setUploadErrors,
  };
}