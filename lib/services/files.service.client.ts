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
   * Upload files with progress tracking
   */
  async upload(files: File[], options: UploadOptions = {}, uploadId?: string): Promise<{ files: FileType[]; errors?: any[] }> {
    const { courseId, folderId, onProgress, onFileProgress } = options;
    const results = { files: [] as FileType[], errors: [] as any[] };
    const PARALLEL_UPLOADS = 3; // Upload 3 files at a time
    let completedFiles = 0;
    
    // Helper function to upload a single file
    const uploadSingleFile = async (file: File, index: number): Promise<{ success: boolean; file?: FileType; error?: string }> => {
      const tempId = `temp-${Date.now()}-${index}`;
      
      try {
        // Notify start
        if (onFileProgress) {
          onFileProgress(tempId, {
            fileId: tempId,
            fileName: file.name,
            progress: 0,
            status: 'pending',
          });
        }
        
        // Prepare form data
        const formData = new FormData();
        formData.append('file', file);
        if (courseId) formData.append('courseId', courseId);
        if (folderId) formData.append('folderId', folderId);
        
        // Create the upload request with retry logic
        const response = await withRetry(async () => {
          const xhr = new XMLHttpRequest();
          
          return new Promise<any>((resolve, reject) => {
            // Set timeout to 30 seconds per file
            xhr.timeout = 30000;
            
            xhr.upload.addEventListener('progress', (event) => {
              if (event.lengthComputable) {
                const progress = (event.loaded / event.total) * 100;
                
                // Update file-specific progress
                if (onFileProgress) {
                  onFileProgress(tempId, {
                    fileId: tempId,
                    fileName: file.name,
                    progress,
                    status: 'uploading',
                  });
                }
                
                // Update overall progress based on completed files + current progress
                const overallProgress = ((completedFiles + progress / 100) / files.length) * 100;
                if (onProgress) onProgress(overallProgress);
              }
            });
            
            xhr.addEventListener('load', () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const response = JSON.parse(xhr.responseText);
                  resolve(response);
                } catch (e) {
                  reject(new Error('Invalid response'));
                }
              } else if (xhr.status === 504) {
                reject(new Error('Upload timeout - file too large or slow connection'));
              } else {
                reject(new Error(`Upload failed: ${xhr.status}`));
              }
            });
            
            xhr.addEventListener('error', () => {
              reject(new Error('Network error during upload'));
            });
            
            xhr.addEventListener('timeout', () => {
              reject(new Error('Upload timeout - file too large or slow connection'));
            });
            
            if (uploadId && this.activeUploads) {
              this.activeUploads.set(uploadId, xhr);
            }
            
            xhr.open('POST', '/api/files/upload');
            xhr.send(formData);
          });
        }, {
          maxRetries: 2, // Retry up to 2 times for timeouts
          initialDelay: 1000,
          shouldRetry: (error) => {
            // Only retry on timeout or network errors
            return error.message.includes('timeout') || error.message.includes('Network error');
          }
        });
        
        if (response.files && response.files.length > 0) {
          // Notify completion
          if (onFileProgress) {
            onFileProgress(tempId, {
              fileId: response.files[0].id,
              fileName: file.name,
              progress: 100,
              status: 'completed',
            });
          }
          return { success: true, file: response.files[0] };
        } else if (response.file) {
          // Handle single file response format
          if (onFileProgress) {
            onFileProgress(tempId, {
              fileId: response.file.id,
              fileName: file.name,
              progress: 100,
              status: 'completed',
            });
          }
          return { success: true, file: response.file };
        } else {
          throw new Error(response.errors?.[0]?.error || response.error || 'Upload failed');
        }
      } catch (error) {
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
        return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
      } finally {
        completedFiles++;
      }
    };
    
    // Process files in parallel batches
    for (let i = 0; i < files.length; i += PARALLEL_UPLOADS) {
      const batch = files.slice(i, i + PARALLEL_UPLOADS);
      const batchPromises = batch.map((file, batchIndex) => 
        uploadSingleFile(file, i + batchIndex)
      );
      
      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      
      // Extract successful uploads and errors
      batchResults.forEach((result, idx) => {
        if (result.success && result.file) {
          results.files.push(result.file);
        } else if (!result.success && result.error) {
          results.errors.push({
            filename: batch[idx]?.name || 'Unknown file',
            error: result.error
          });
        }
      });
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
   * Get user's files (client version without caching)
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
        const progress = Math.round((bytesUploaded / bytesTotal) * 100);
        if (onProgress) onProgress(progress);
        if (onFileProgress) {
          onFileProgress(file.name, {
            fileId: file.name,
            fileName: file.name,
            progress,
            status: 'uploading',
          });
        }
      },
      onSuccess: () => {
        if (onFileProgress) {
          onFileProgress(file.name, {
            fileId: file.name,
            fileName: file.name,
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
}

export const filesService = new FilesService();