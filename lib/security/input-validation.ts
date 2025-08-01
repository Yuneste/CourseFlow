import { z } from 'zod';

// Common validation schemas used across the application

// File validation schemas
export const fileUpdateSchema = z.object({
  display_name: z.string().min(1).max(255).optional(),
  ai_summary: z.string().max(5000).optional(),
  ai_category: z.enum(['lecture', 'assignment', 'notes', 'exam', 'other']).optional(),
  ai_confidence: z.number().min(0).max(1).optional(),
  // Explicitly define allowed fields - any other fields will be rejected
}).strict();

// Course validation schemas
export const courseCreateSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().max(20).optional(),
  professor: z.string().max(100).optional(),
  term: z.string().min(1),
  academic_period_type: z.enum(['semester', 'term', 'trimester']).optional(),
  credits: z.number().int().min(0).max(10).optional(),
  ects_credits: z.number().int().min(0).max(30).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  emoji: z.string().emoji().optional(),
});

export const courseUpdateSchema = courseCreateSchema.partial().strict();

// Folder validation schemas
export const folderCreateSchema = z.object({
  course_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  parent_id: z.string().uuid().optional(),
});

export const folderUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  display_order: z.number().int().min(0).optional(),
}).strict();

export const folderBatchUpdateSchema = z.array(z.object({
  id: z.string().uuid(),
  display_order: z.number().int().min(0),
}));

// Profile validation schemas
export const profileUpdateSchema = z.object({
  full_name: z.string().max(100).optional(),
  university: z.string().max(200).optional(),
  study_program: z.string().max(200).optional(),
  degree_type: z.enum([
    'bachelor', 'master', 'phd', 'diploma', 
    'associate', 'undergraduate', 'graduate', 
    'postgraduate', 'other'
  ]).optional(),
  start_year: z.number().int().min(1900).max(2100).optional(),
  expected_graduation_year: z.number().int().min(1900).max(2100).optional(),
  academic_system: z.enum(['gpa', 'ects', 'uk_honours', 'percentage']).optional(),
  preferred_locale: z.string().length(2).optional(),
  country: z.string().length(2).optional(),
  timezone: z.string().optional(),
}).strict();

// Common validation helpers
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const uuidSchema = z.string().uuid();

export const emailSchema = z.string().email();

// Sanitization helpers
export function sanitizeString(str: string): string {
  // Remove any HTML tags
  return str.replace(/<[^>]*>/g, '')
    // Remove any script tags more thoroughly
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Trim whitespace
    .trim();
}

export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts
  return fileName
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    // Remove special characters except common ones
    .replace(/[^a-zA-Z0-9._\- ]/g, '')
    // Limit length
    .substring(0, 255);
}

// Validation error formatter
export function formatValidationErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  });
  
  return formatted;
}