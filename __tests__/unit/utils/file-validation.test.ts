import { describe, it, expect, vi } from 'vitest';
import {
  validateFileType,
  validateFileSize,
  validateFileBatch,
  validateMagicBytes,
  formatFileSize,
  calculateFileHash,
  sanitizeFilename,
  getFileExtension,
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES,
} from '@/lib/utils/file-validation';

describe('File Validation Utils', () => {
  describe('validateFileType', () => {
    it('should accept valid PDF files', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = validateFileType(file);
      expect(result.valid).toBe(true);
      expect(result.category).toBe('document');
    });

    it('should accept valid image files', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const result = validateFileType(file);
      expect(result.valid).toBe(true);
      expect(result.category).toBe('image');
    });

    it('should reject invalid file types', () => {
      const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
      const result = validateFileType(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File type not allowed');
    });
  });

  describe('validateFileSize', () => {
    it('should accept files under size limit', () => {
      const file = new File(['x'.repeat(1024 * 1024)], 'test.pdf', { type: 'application/pdf' });
      const result = validateFileSize(file);
      expect(result.valid).toBe(true);
    });

    it('should reject files over size limit', () => {
      // Create a mock file with size over 50MB
      const file = new File([], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 60 * 1024 * 1024 });
      
      const result = validateFileSize(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds limit');
    });
  });

  describe('validateFileBatch', () => {
    it('should accept valid batch of files', () => {
      const files = [
        new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'file2.pdf', { type: 'application/pdf' }),
      ];
      const result = validateFileBatch(files);
      expect(result.valid).toBe(true);
    });

    it('should reject batch with too many files', () => {
      const files = Array(15).fill(null).map((_, i) => 
        new File(['content'], `file${i}.pdf`, { type: 'application/pdf' })
      );
      const result = validateFileBatch(files);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maximum 10 files');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove special characters', () => {
      expect(sanitizeFilename('file@#$%.pdf')).toBe('file.pdf');
    });

    it('should replace spaces with underscores', () => {
      expect(sanitizeFilename('my file name.pdf')).toBe('my_file_name.pdf');
    });

    it('should limit filename length', () => {
      const longName = 'a'.repeat(150) + '.pdf';
      const result = sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(104); // 100 + '.pdf'
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension', () => {
      expect(getFileExtension('file.pdf')).toBe('.pdf');
      expect(getFileExtension('file.tar.gz')).toBe('.gz');
      expect(getFileExtension('noextension')).toBe('');
    });
  });

  describe('validateMagicBytes', () => {
    it('should validate PDF magic bytes', async () => {
      // Create a file with PDF magic bytes
      const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // %PDF
      const file = new File([pdfBytes], 'test.pdf', { type: 'application/pdf' });
      
      const result = await validateMagicBytes(file);
      expect(result.valid).toBe(true);
    });

    it('should validate PNG magic bytes', async () => {
      // Create a file with PNG magic bytes
      const pngBytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47]); // PNG
      const file = new File([pngBytes], 'test.png', { type: 'image/png' });
      
      const result = await validateMagicBytes(file);
      expect(result.valid).toBe(true);
    });

    it('should reject files with invalid magic bytes', async () => {
      // Create a file with wrong magic bytes
      const wrongBytes = new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF]);
      const file = new File([wrongBytes], 'test.pdf', { type: 'application/pdf' });
      
      const result = await validateMagicBytes(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('does not match the expected format');
    });

    it('should accept text files without magic bytes check', async () => {
      const file = new File(['plain text content'], 'test.txt', { type: 'text/plain' });
      
      const result = await validateMagicBytes(file);
      expect(result.valid).toBe(true);
    });
  });

  describe('calculateFileHash', () => {
    it('should calculate SHA-256 hash', async () => {
      // Mock crypto.subtle.digest
      const mockDigest = vi.fn().mockResolvedValue(
        new ArrayBuffer(32) // 32 bytes for SHA-256
      );
      global.crypto = {
        subtle: { digest: mockDigest },
      } as any;

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const hash = await calculateFileHash(file);
      
      expect(mockDigest).toHaveBeenCalledWith('SHA-256', expect.any(ArrayBuffer));
      expect(hash).toMatch(/^[0-9a-f]{64}$/); // SHA-256 hex string
    });

    it('should handle fallback when crypto.subtle is not available', async () => {
      // Remove crypto.subtle
      global.crypto = {} as any;

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const hash = await calculateFileHash(file);
      
      // Should return a base64 encoded fallback hash
      expect(hash).toBeTruthy();
      expect(hash.length).toBeGreaterThan(0);
    });
  });
});