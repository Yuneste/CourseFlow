/**
 * File upload service
 * Handles all file upload operations with validation, deduplication, and storage
 */

import { createClient } from '@/lib/supabase/server';
import { 
  validateFileType, 
  validateFileSize, 
  validateMagicBytes,
  calculateFileHash,
  sanitizeFilename
} from '@/lib/utils/file-validation';
import { categorizeFile, getCategoryFolder } from '@/lib/utils/file-categorization';
import { logger } from '@/lib/services/logger.service';
import { FILE_UPLOAD, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants';
import type { File as FileType } from '@/types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Types
export interface UploadRequest {
  files: File[];
  courseId: string | null;
  folderId: string | null;
  userId: string;
  userAgent: string | null;
}

export interface UploadResult {
  file?: FileType;
  error?: string;
  filename: string;
}

export interface UploadResponse {
  files: FileType[];
  errors?: UploadResult[];
}

interface FileValidationResult {
  isValid: boolean;
  error?: string;
  category?: string;
}

interface FileMetadata {
  user_id: string;
  course_id: string | null;
  folder_id: string | null;
  original_name: string;
  display_name: string;
  storage_url: string;
  file_type: string;
  file_size: number;
  file_hash: string;
  upload_source: 'web';
  is_academic_content: boolean;
  ai_category: string;
}

export class UploadService {
  /**
   * Validate upload request
   */
  static validateRequest(files: File[]): { isValid: boolean; error?: string } {
    if (!files || files.length === 0) {
      return { isValid: false, error: ERROR_MESSAGES.GENERIC };
    }

    if (files.length > FILE_UPLOAD.MAX_BATCH_SIZE) {
      return { 
        isValid: false, 
        error: `Maximum ${FILE_UPLOAD.MAX_BATCH_SIZE} files can be uploaded at once` 
      };
    }

    return { isValid: true };
  }

  /**
   * Validate a single file
   */
  private static async validateFile(file: File): Promise<FileValidationResult> {
    // Validate file type
    const typeValidation = validateFileType(file);
    if (!typeValidation.valid) {
      return { isValid: false, error: typeValidation.error };
    }

    // Validate file size
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      return { isValid: false, error: sizeValidation.error };
    }

    // Validate magic bytes
    const magicValidation = await validateMagicBytes(file);
    if (!magicValidation.valid) {
      return { isValid: false, error: magicValidation.error };
    }

    return { isValid: true, category: typeValidation.category };
  }

  /**
   * Check for duplicate files based on file hash
   * 
   * Performs course-specific duplicate checking when courseId is provided,
   * otherwise checks across all user files
   * 
   * @param supabase - Authenticated Supabase client
   * @param userId - User ID to check duplicates for
   * @param fileHash - SHA-256 hash of the file content
   * @param courseId - Optional course ID for course-specific duplicate check
   * 
   * @returns Object containing:
   *   - isDuplicate: boolean indicating if duplicate exists
   *   - existingFileName?: string name of the duplicate file if found
   * 
   * @private
   */
  private static async checkDuplicate(
    supabase: SupabaseClient,
    userId: string,
    fileHash: string,
    courseId?: string | null
  ): Promise<{ isDuplicate: boolean; existingFileName?: string }> {
    // Build query based on whether courseId is provided
    let query = supabase
      .from('files')
      .select('id, display_name')
      .eq('user_id', userId)
      .eq('file_hash', fileHash);

    // If courseId is provided, only check within that course
    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: existingFile } = await query.single();

    if (existingFile) {
      return { 
        isDuplicate: true, 
        existingFileName: existingFile.display_name 
      };
    }

    return { isDuplicate: false };
  }

  /**
   * Generate storage path
   */
  private static generateStoragePath(
    userId: string,
    fileName: string,
    categoryFolder: string,
    courseId?: string | null
  ): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const sanitizedName = sanitizeFilename(fileName);
    
    return courseId 
      ? `${userId}/${courseId}/${categoryFolder}/${timestamp}-${randomStr}-${sanitizedName}`
      : `${userId}/general/${categoryFolder}/${timestamp}-${randomStr}-${sanitizedName}`;
  }

  /**
   * Upload file to storage
   */
  private static async uploadToStorage(
    supabase: SupabaseClient,
    file: File,
    storagePath: string
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.storage
      .from('user-files')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      logger.error('Storage upload failed', error, {
        action: 'uploadToStorage',
        metadata: {
          storagePath,
          fileType: file.type,
          fileSize: file.size,
        }
      });
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Save file metadata to database
   */
  private static async saveFileMetadata(
    supabase: SupabaseClient,
    metadata: FileMetadata
  ): Promise<{ file?: FileType; error?: string }> {
    const { data, error } = await supabase
      .from('files')
      .insert(metadata)
      .select()
      .single();

    if (error) {
      logger.error('Failed to save file metadata', error, {
        action: 'saveFileMetadata',
        metadata: { ...metadata }
      });
      return { error: 'Failed to save file metadata' };
    }

    return { file: data };
  }

  /**
   * Track upload analytics
   */
  private static async trackAnalytics(
    supabase: SupabaseClient,
    userId: string,
    fileId: string,
    file: File,
    userAgent: string | null
  ): Promise<void> {
    try {
      await supabase.from('upload_analytics').insert({
        user_id: userId,
        file_id: fileId,
        upload_status: 'completed',
        file_type: file.type,
        file_size: file.size,
        upload_duration_ms: 0, // Would be calculated in real implementation
        client_info: { userAgent },
      });
    } catch (error) {
      logger.warn('Failed to track upload analytics', {
        action: 'trackAnalytics',
        metadata: { fileId }
      });
    }
  }

  /**
   * Process single file upload with comprehensive validation and error handling
   * 
   * @param supabase - Authenticated Supabase client instance
   * @param file - File object to upload
   * @param userId - ID of the user uploading the file
   * @param courseId - Optional course ID to associate the file with
   * @param folderId - Optional folder ID to place the file in
   * @param userAgent - User agent string for analytics tracking
   * 
   * @returns Promise<UploadResult> containing either:
   *   - Success: { file: FileType, filename: string }
   *   - Error: { error: string, filename: string }
   * 
   * @throws Never - All errors are caught and returned in result object
   * 
   * @example
   * const result = await UploadService.processFile(
   *   supabase,
   *   file,
   *   'user123',
   *   'course456',
   *   null,
   *   'Mozilla/5.0...'
   * );
   * 
   * if (result.error) {
   *   console.error('Upload failed:', result.error);
   * } else {
   *   console.log('File uploaded:', result.file);
   * }
   */
  static async processFile(
    supabase: SupabaseClient,
    file: File,
    userId: string,
    courseId: string | null,
    folderId: string | null,
    userAgent: string | null
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = await this.validateFile(file);
      if (!validation.isValid) {
        return { error: validation.error, filename: file.name };
      }

      // Calculate file hash
      const fileHash = await calculateFileHash(file);

      // Check for duplicates
      const duplicateCheck = await this.checkDuplicate(supabase, userId, fileHash, courseId);
      if (duplicateCheck.isDuplicate) {
        const error = courseId
          ? `File "${duplicateCheck.existingFileName || file.name}" already exists in this course`
          : `File "${duplicateCheck.existingFileName || file.name}" already exists`;
        return { error, filename: file.name };
      }

      // Categorize file
      const aiCategory = categorizeFile(file.name);
      const categoryFolder = getCategoryFolder(aiCategory);

      // Generate storage path
      const storagePath = this.generateStoragePath(userId, file.name, categoryFolder, courseId);

      // Upload to storage
      const uploadResult = await this.uploadToStorage(supabase, file, storagePath);
      if (!uploadResult.success) {
        return { 
          error: `${ERROR_MESSAGES.UPLOAD_FAILED}: ${uploadResult.error}`, 
          filename: file.name 
        };
      }

      // Prepare file metadata
      const metadata: FileMetadata = {
        user_id: userId,
        course_id: courseId,
        folder_id: folderId,
        original_name: file.name,
        display_name: file.name,
        storage_url: storagePath,
        file_type: file.type,
        file_size: file.size,
        file_hash: fileHash,
        upload_source: 'web',
        is_academic_content: true, // For MVP, all content is considered valid
        ai_category: aiCategory,
      };

      // Save to database
      const { file: savedFile, error: dbError } = await this.saveFileMetadata(supabase, metadata);
      if (dbError) {
        // Clean up uploaded file on database error
        await supabase.storage.from('user-files').remove([storagePath]);
        return { error: dbError, filename: file.name };
      }

      // Track analytics
      if (savedFile) {
        await this.trackAnalytics(supabase, userId, savedFile.id, file, userAgent);
      }

      return { file: savedFile, filename: file.name };

    } catch (error) {
      logger.error('Error processing file upload', error, {
        action: 'processFile',
        metadata: { filename: file.name }
      });
      return { error: ERROR_MESSAGES.GENERIC, filename: file.name };
    }
  }

  /**
   * Process batch file upload
   */
  static async uploadBatch(request: UploadRequest): Promise<UploadResponse> {
    const supabase = await createClient();
    const BATCH_SIZE = 3; // Process files in batches of 3 to avoid timeouts
    
    const allSuccessfulUploads: FileType[] = [];
    const allFailedUploads: UploadResult[] = [];
    
    // Process files in smaller batches
    for (let i = 0; i < request.files.length; i += BATCH_SIZE) {
      const batch = request.files.slice(i, i + BATCH_SIZE);
      
      // Process batch in parallel
      const uploadPromises = batch.map(file =>
        this.processFile(
          supabase,
          file,
          request.userId,
          request.courseId,
          request.folderId,
          request.userAgent
        )
      );

      try {
        const batchResults = await Promise.all(uploadPromises);
        
        // Separate successful and failed uploads
        const successfulUploads = batchResults.filter(r => r.file).map(r => r.file!);
        const failedUploads = batchResults.filter(r => r.error);
        
        allSuccessfulUploads.push(...successfulUploads);
        allFailedUploads.push(...failedUploads);
        
        // Log batch progress
        logger.info('Batch processing progress', {
          action: 'uploadBatchProgress',
          metadata: {
            userId: request.userId,
            batchNumber: Math.floor(i / BATCH_SIZE) + 1,
            totalBatches: Math.ceil(request.files.length / BATCH_SIZE),
            batchSuccess: successfulUploads.length,
            batchFailed: failedUploads.length,
          }
        });
      } catch (error) {
        // If entire batch fails, mark all files in batch as failed
        logger.error('Batch processing failed', error, {
          action: 'uploadBatchError',
          metadata: {
            userId: request.userId,
            batchNumber: Math.floor(i / BATCH_SIZE) + 1,
            batchSize: batch.length
          }
        });
        
        batch.forEach(file => {
          allFailedUploads.push({
            filename: file.name,
            error: 'Batch processing failed'
          });
        });
      }
    }

    // Log batch upload completion
    logger.info('Batch file upload completed', {
      action: 'uploadBatch',
      metadata: {
        userId: request.userId,
        filesUploaded: allSuccessfulUploads.length,
        filesFailed: allFailedUploads.length,
      }
    });

    return {
      files: allSuccessfulUploads,
      errors: allFailedUploads.length > 0 ? allFailedUploads : undefined,
    };
  }

  /**
   * Delete file from storage and database
   */
  static async deleteFile(fileId: string, userId: string): Promise<void> {
    const supabase = await createClient();

    // Get file info
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('storage_url')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !file) {
      throw new Error('File not found');
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('user-files')
      .remove([file.storage_url]);

    if (storageError) {
      logger.error('Failed to delete file from storage', storageError, {
        action: 'deleteFile',
        metadata: { fileId, storageUrl: file.storage_url }
      });
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', userId);

    if (dbError) {
      throw dbError;
    }
  }
}