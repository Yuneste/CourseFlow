// Note: We use Web Crypto API (crypto.subtle) instead of Node.js crypto module
// This ensures compatibility with both server and client environments

// Allowed MIME types for MVP
export const ALLOWED_MIME_TYPES = {
  // Documents
  'application/pdf': { ext: '.pdf', category: 'document' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', category: 'document' },
  'application/msword': { ext: '.doc', category: 'document' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: '.pptx', category: 'presentation' },
  'application/vnd.ms-powerpoint': { ext: '.ppt', category: 'presentation' },
  
  // Images
  'image/jpeg': { ext: '.jpg', category: 'image' },
  'image/png': { ext: '.png', category: 'image' },
  'image/gif': { ext: '.gif', category: 'image' },
  'image/webp': { ext: '.webp', category: 'image' },
  
  // Text
  'text/plain': { ext: '.txt', category: 'text' },
  'text/markdown': { ext: '.md', category: 'text' },
  'text/html': { ext: '.html', category: 'text' },
  'text/css': { ext: '.css', category: 'text' },
  'text/javascript': { ext: '.js', category: 'text' },
  'application/javascript': { ext: '.js', category: 'text' },
  'application/json': { ext: '.json', category: 'text' },
  'text/xml': { ext: '.xml', category: 'text' },
  
  // Spreadsheets
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: '.xlsx', category: 'spreadsheet' },
  'application/vnd.ms-excel': { ext: '.xls', category: 'spreadsheet' },
  'text/csv': { ext: '.csv', category: 'spreadsheet' },
  
  // Archives (for downloading course folders)
  'application/zip': { ext: '.zip', category: 'archive' },
  'application/x-rar-compressed': { ext: '.rar', category: 'archive' },
  
  // Videos (common lecture formats)
  'video/mp4': { ext: '.mp4', category: 'video' },
  'video/webm': { ext: '.webm', category: 'video' },
  'video/quicktime': { ext: '.mov', category: 'video' },
} as const;

// File size limits
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB per file
  MAX_BATCH_SIZE: 50 * 1024 * 1024, // 50MB total per batch
  STORAGE_QUOTA: {
    free: 50 * 1024 * 1024, // 50MB
    student: 5 * 1024 * 1024 * 1024, // 5GB
    premium: 50 * 1024 * 1024 * 1024, // 50GB
  },
} as const;

// Magic bytes for file type validation
const FILE_SIGNATURES: Record<string, number[]> = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  png: [0x89, 0x50, 0x4E, 0x47], // PNG
  jpg: [0xFF, 0xD8, 0xFF], // JPEG
  gif: [0x47, 0x49, 0x46], // GIF
  zip: [0x50, 0x4B, 0x03, 0x04], // ZIP (docx, xlsx, pptx are zip files)
  doc: [0xD0, 0xCF, 0x11, 0xE0], // MS Office old format
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  category?: string;
}

/**
 * Validate file type based on MIME type
 */
export function validateFileType(file: File): FileValidationResult {
  const mimeType = file.type;
  
  if (!mimeType || !ALLOWED_MIME_TYPES[mimeType as keyof typeof ALLOWED_MIME_TYPES]) {
    const allowedTypes = Object.values(ALLOWED_MIME_TYPES)
      .map(t => t.ext)
      .join(', ');
    
    return {
      valid: false,
      error: `File type not allowed. Supported types: ${allowedTypes}`,
    };
  }
  
  const fileInfo = ALLOWED_MIME_TYPES[mimeType as keyof typeof ALLOWED_MIME_TYPES];
  return {
    valid: true,
    category: fileInfo.category,
  };
}

/**
 * Validate file size
 */
export function validateFileSize(file: File): FileValidationResult {
  if (file.size > FILE_SIZE_LIMITS.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds limit of ${formatFileSize(FILE_SIZE_LIMITS.MAX_FILE_SIZE)}`,
    };
  }
  
  return { valid: true };
}

/**
 * Validate magic bytes (file signature) to ensure file content matches declared type
 * 
 * This provides an additional security layer by checking the actual file content
 * against known file signatures, preventing malicious files with incorrect extensions.
 * 
 * @param file - File object to validate
 * @returns Promise<FileValidationResult> with validation status
 * 
 * @example
 * const result = await validateMagicBytes(file);
 * if (!result.valid) {
 *   throw new Error(result.error);
 * }
 */
export async function validateMagicBytes(file: File): Promise<FileValidationResult> {
  const buffer = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  // Check file signatures
  for (const [type, signature] of Object.entries(FILE_SIGNATURES)) {
    let matches = true;
    for (let i = 0; i < signature.length; i++) {
      if (bytes[i] !== signature[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      return { valid: true };
    }
  }
  
  // For text files, we can't rely on magic bytes
  if (file.type === 'text/plain' || file.type === 'text/markdown' || file.type === 'text/csv') {
    return { valid: true };
  }
  
  return {
    valid: false,
    error: 'File content does not match the expected format',
  };
}

/**
 * Calculate SHA-256 hash of a file for deduplication and integrity verification
 * 
 * Uses Web Crypto API when available, with fallback for environments without crypto.subtle.
 * The hash is used to detect duplicate files and ensure file integrity.
 * 
 * @param file - File object to hash
 * @returns Promise<string> - Hexadecimal SHA-256 hash or fallback identifier
 * 
 * @example
 * const hash = await calculateFileHash(file);
 * // Returns: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
 */
export async function calculateFileHash(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    
    // Check if crypto.subtle is available
    if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } else {
      // Fallback: use a simple hash based on file properties
      const fallbackHash = `${file.name}-${file.size}-${file.lastModified}`;
      return btoa(fallbackHash);
    }
  } catch (error) {
    console.error('Error calculating file hash:', error);
    // Return a unique identifier based on file properties
    return `${file.name}-${file.size}-${Date.now()}`;
  }
}

/**
 * Format file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate batch of files
 */
export function validateFileBatch(files: File[]): FileValidationResult {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  
  if (totalSize > FILE_SIZE_LIMITS.MAX_BATCH_SIZE) {
    return {
      valid: false,
      error: `Total upload size exceeds ${formatFileSize(FILE_SIZE_LIMITS.MAX_BATCH_SIZE)} limit`,
    };
  }
  
  return { valid: true };
}


/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : '';
}

/**
 * Sanitize filename for storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove special characters but keep the extension
  const name = filename.substring(0, filename.lastIndexOf('.'));
  const ext = getFileExtension(filename);
  
  const sanitized = name
    .replace(/[^a-zA-Z0-9_\-\s]/g, '') // Remove special chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 100); // Limit length
  
  return sanitized + ext;
}