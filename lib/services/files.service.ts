import { api } from '@/lib/api/client';
import type { File as FileType, UploadProgress } from '@/types';
import { calculateFileHash } from '@/lib/utils/file-validation';
import { createResumableUpload, checkResumableSession } from '@/lib/utils/tus-upload';
import { withRetry } from '@/lib/utils/retry';

export interface UploadOptions {
  courseId?: string;
  folderId?: string;
  onProgress?: (progress: number) => void;
  onFileProgress?: (fileId: string, progress: UploadProgress) => void;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingFile?: {
    id: string;
    display_name: string;
    file_size: number;
    created_at: string;
    course_id?: string;
  };
}

class FilesService {
  private activeUploads = new Map<string, XMLHttpRequest>();
  /**
   * Upload files with progress tracking
   * Returns both promise and uploadId for cancellation
   */
  uploadWithCancel(files: File[], options: UploadOptions = {}): { promise: Promise<{ files: FileType[]; errors?: any[] }>; uploadId: string } {
    const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const promise = this.upload(files, options, uploadId);
    return { promise, uploadId };
  }
  
  /**
   * Cancel an active upload
   */
  cancelUpload(uploadId: string): boolean {
    const xhr = this.activeUploads.get(uploadId);
    if (xhr && xhr.readyState !== XMLHttpRequest.DONE) {
      xhr.abort();
      this.activeUploads.delete(uploadId);
      return true;
    }
    return false;
  }
  
  /**
   * Cancel all active uploads
   */
  cancelAllUploads(): void {
    this.activeUploads.forEach((xhr, uploadId) => {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        xhr.abort();
      }
    });
    this.activeUploads.clear();
  }

  /**
   * Upload files with progress tracking
   */
  private async upload(files: File[], options: UploadOptions = {}, uploadId?: string) {
    const { courseId, folderId, onProgress, onFileProgress } = options;
    const formData = new FormData();
    
    // Add files to form data
    files.forEach(file => formData.append('files', file));
    if (courseId) {
      formData.append('course_id', courseId);
    }
    if (folderId) {
      formData.append('folder_id', folderId);
    }
    
    // Use XMLHttpRequest for progress tracking
    return new Promise<{ files: FileType[]; errors?: any[] }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });
      
      // Handle completion
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error || 'Upload failed'));
        }
      };
      
      // Handle errors
      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };
      
      // Handle abort
      xhr.onabort = () => {
        reject(new Error('Upload cancelled'));
      };
      
      // Track active upload if uploadId provided
      if (uploadId) {
        this.activeUploads.set(uploadId, xhr);
      }
      
      // Send request
      xhr.open('POST', '/api/files/upload');
      xhr.send(formData);
      
      // Clean up on completion
      xhr.onloadend = () => {
        if (uploadId) {
          this.activeUploads.delete(uploadId);
        }
      };
    });
  }

  /**
   * Upload files with individual progress tracking
   */
  async uploadWithQueue(files: File[], options: UploadOptions = {}): Promise<{ files: FileType[]; errors: any[] }> {
    const { courseId, folderId, onFileProgress } = options;
    const results: { files: FileType[]; errors: any[] } = { files: [], errors: [] };
    
    // Process files sequentially for better progress tracking
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempId = `temp-${Date.now()}-${i}`;
      
      try {
        // Notify progress start
        if (onFileProgress) {
          onFileProgress(tempId, {
            fileId: tempId,
            fileName: file.name,
            progress: 0,
            status: 'uploading',
          });
        }
        
        // Upload single file with retry
        const response = await withRetry(
          () => this.upload([file], {
            courseId,
            folderId,
            onProgress: (progress) => {
              if (onFileProgress) {
                onFileProgress(tempId, {
                  fileId: tempId,
                  fileName: file.name,
                  progress,
                  status: 'uploading',
                });
              }
            }
          }),
          {
            maxRetries: 3,
            shouldRetry: (error) => {
              // Don't retry validation errors
              if (error.message?.includes('File type not allowed')) return false;
              if (error.message?.includes('File size exceeds')) return false;
              if (error.message?.includes('Duplicate file')) return false;
              // Retry network and server errors
              return true;
            }
          }
        );
        
        if (response.files && response.files.length > 0) {
          results.files.push(...response.files);
          
          // Notify completion
          if (onFileProgress) {
            onFileProgress(tempId, {
              fileId: response.files[0].id,
              fileName: file.name,
              progress: 100,
              status: 'completed',
            });
          }
        }
        
        if (response.errors && response.errors.length > 0) {
          results.errors.push(...response.errors);
          
          // Notify error
          if (onFileProgress && response.errors[0]) {
            onFileProgress(tempId, {
              fileId: tempId,
              fileName: file.name,
              progress: 0,
              status: 'failed',
              error: response.errors[0].error,
            });
          }
        }
      } catch (error) {
        // Handle upload error
        results.errors.push({
          filename: file.name,
          error: error instanceof Error ? error.message : 'Upload failed',
        });
        
        // Notify error
        if (onFileProgress) {
          onFileProgress(tempId, {
            fileId: tempId,
            fileName: file.name,
            progress: 0,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Upload failed',
          });
        }
      }
    }
    
    return results;
  }

  /**
   * Check if a file is a duplicate before uploading
   */
  async checkDuplicate(file: File, courseId?: string): Promise<DuplicateCheckResult> {
    const hash = await calculateFileHash(file);
    const params = new URLSearchParams({ hash });
    if (courseId) {
      params.append('courseId', courseId);
    }
    return api.get<DuplicateCheckResult>(`/files/check-duplicate?${params.toString()}`);
  }

  /**
   * Get user's files
   */
  async getFiles(courseId?: string): Promise<FileType[]> {
    const query = courseId ? `?course_id=${courseId}` : '';
    return api.get<FileType[]>(`/files${query}`);
  }

  /**
   * Update a file
   */
  async updateFile(id: string, updates: Partial<FileType>): Promise<FileType> {
    return api.patch<FileType>(`/files/${id}`, updates);
  }

  /**
   * Delete a file
   */
  async deleteFile(id: string): Promise<void> {
    return api.delete(`/files/${id}`);
  }

  /**
   * Get signed download URL for a file
   */
  async getDownloadUrl(fileId: string): Promise<{
    url: string;
    filename: string;
    contentType: string;
    size: number;
  }> {
    return api.get(`/files/${fileId}/download`);
  }

  /**
   * Upload file with resumable support using TUS protocol
   */
  async uploadResumable(
    file: File,
    options: UploadOptions & {
      onPause?: () => void;
      onResume?: () => void;
    } = {}
  ): Promise<{
    upload: ReturnType<typeof createResumableUpload>;
    hasExistingSession: boolean;
    existingProgress?: number;
  }> {
    const { courseId, onProgress, onFileProgress } = options;
    
    // Check for existing session
    const sessionCheck = await checkResumableSession(file);
    
    // Create resumable upload
    const upload = createResumableUpload({
      file,
      courseId,
      onProgress: (bytesUploaded, bytesTotal) => {
        const progress = (bytesUploaded / bytesTotal) * 100;
        if (onProgress) {
          onProgress(progress);
        }
        if (onFileProgress) {
          onFileProgress(file.name, {
            fileId: file.name,
            fileName: file.name,
            fileSize: file.size,
            progress,
            status: 'uploading',
            uploadSpeed: 0, // Could calculate based on time
          });
        }
      },
      onSuccess: async (uploadUrl) => {
        // Register file in our database after successful upload
        const formData = new FormData();
        formData.append('uploadUrl', uploadUrl);
        formData.append('fileName', file.name);
        formData.append('fileSize', file.size.toString());
        formData.append('fileType', file.type);
        if (courseId) {
          formData.append('courseId', courseId);
        }
        
        await fetch('/api/files/register-upload', {
          method: 'POST',
          body: formData,
        });
        
        if (onFileProgress) {
          onFileProgress(file.name, {
            fileId: file.name,
            fileName: file.name,
            fileSize: file.size,
            progress: 100,
            status: 'completed',
          });
        }
      },
      onError: (error) => {
        if (onFileProgress) {
          onFileProgress(file.name, {
            fileId: file.name,
            fileName: file.name,
            fileSize: file.size,
            progress: 0,
            status: 'failed',
            error: error.message,
          });
        }
      },
    });
    
    return {
      upload,
      hasExistingSession: sessionCheck.hasSession,
      existingProgress: sessionCheck.progress,
    };
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    totalSize: number;
    fileCount: number;
    byType: Record<string, { count: number; size: number }>;
  }> {
    const files = await this.getFiles();
    
    const stats = files.reduce((acc, file) => {
      acc.totalSize += file.file_size;
      acc.fileCount += 1;
      
      const type = file.file_type.split('/')[0] || 'other';
      if (!acc.byType[type]) {
        acc.byType[type] = { count: 0, size: 0 };
      }
      acc.byType[type].count += 1;
      acc.byType[type].size += file.file_size;
      
      return acc;
    }, {
      totalSize: 0,
      fileCount: 0,
      byType: {} as Record<string, { count: number; size: number }>,
    });
    
    return stats;
  }
}

export const filesService = new FilesService();