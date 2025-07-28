/**
 * Academic content detection utilities
 */

import { detectAcademicContent as detectImageAcademicContent } from './image-optimizer';

export interface AcademicDetectionResult {
  isAcademic: boolean;
  confidence: number;
  detectedContent: string;
  warnings: string[];
}

// Monthly image upload limits by tier
export const IMAGE_UPLOAD_LIMITS = {
  free: 20,
  student: 100,
  premium: 500,
} as const;

/**
 * Detect if a file contains academic content
 */
export async function detectAcademicContent(
  file: File
): Promise<AcademicDetectionResult> {
  const warnings: string[] = [];
  
  // Handle different file types
  if (file.type.startsWith('image/')) {
    const result = await detectImageAcademicContent(file);
    
    // Add warnings for non-academic images
    if (!result.isAcademic) {
      warnings.push('This image does not appear to contain academic content');
      
      if (result.detectedContent === 'photo') {
        warnings.push('Personal photos should be related to coursework');
      }
    }
    
    return {
      isAcademic: result.isAcademic,
      confidence: result.confidence,
      detectedContent: result.detectedContent,
      warnings,
    };
  }
  
  // PDF files are generally academic
  if (file.type === 'application/pdf') {
    return {
      isAcademic: true,
      confidence: 0.9,
      detectedContent: 'document',
      warnings: [],
    };
  }
  
  // Office documents are generally academic
  if (
    file.type.includes('word') ||
    file.type.includes('powerpoint') ||
    file.type.includes('excel') ||
    file.type.includes('spreadsheet')
  ) {
    return {
      isAcademic: true,
      confidence: 0.85,
      detectedContent: 'document',
      warnings: [],
    };
  }
  
  // Text files could be notes
  if (file.type.startsWith('text/')) {
    return {
      isAcademic: true,
      confidence: 0.8,
      detectedContent: 'notes',
      warnings: [],
    };
  }
  
  // Unknown file types - default to allowing but with low confidence
  return {
    isAcademic: true,
    confidence: 0.5,
    detectedContent: 'unknown',
    warnings: ['Unable to determine if this file contains academic content'],
  };
}

/**
 * Check if user has exceeded their monthly image upload limit
 */
export async function checkImageUploadLimit(
  userId: string,
  userTier: keyof typeof IMAGE_UPLOAD_LIMITS,
  currentMonthUploads: number
): Promise<{
  allowed: boolean;
  limit: number;
  used: number;
  percentageUsed: number;
  warning?: string;
}> {
  const limit = IMAGE_UPLOAD_LIMITS[userTier];
  const percentageUsed = (currentMonthUploads / limit) * 100;
  
  let warning: string | undefined;
  let allowed = true;
  
  if (percentageUsed >= 90) {
    warning = `You've used ${currentMonthUploads} of ${limit} image uploads this month`;
    // At 90%, only allow academic images
    allowed = true; // Will be enforced by requiring academic content
  } else if (percentageUsed >= 75) {
    warning = `You've used ${Math.round(percentageUsed)}% of your monthly image uploads`;
  } else if (percentageUsed >= 50) {
    warning = `${limit - currentMonthUploads} image uploads remaining this month`;
  }
  
  return {
    allowed: currentMonthUploads < limit,
    limit,
    used: currentMonthUploads,
    percentageUsed,
    warning,
  };
}

/**
 * Get upload restrictions based on usage
 */
export function getUploadRestrictions(percentageUsed: number): {
  requireCourseSelection: boolean;
  requireAcademicContent: boolean;
  allowNonAcademicImages: boolean;
} {
  return {
    requireCourseSelection: percentageUsed >= 75,
    requireAcademicContent: percentageUsed >= 90,
    allowNonAcademicImages: percentageUsed < 90,
  };
}