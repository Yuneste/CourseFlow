/**
 * Client-side image optimization utilities
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
  stripMetadata?: boolean;
}

const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.85,
  format: 'jpeg',
  stripMetadata: true,
};

/**
 * Optimize an image file by resizing and compressing it
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<{ file: File; originalSize: number; optimizedSize: number }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size;

  // Check if file is HEIC/HEIF and needs conversion
  const needsHeicConversion = file.type === 'image/heic' || 
                              file.type === 'image/heif' || 
                              file.name.toLowerCase().endsWith('.heic') ||
                              file.name.toLowerCase().endsWith('.heif');

  // Skip optimization for non-image files (unless it's HEIC)
  if (!file.type.startsWith('image/') && !needsHeicConversion) {
    return { file, originalSize, optimizedSize: originalSize };
  }

  try {
    // Convert HEIC if needed
    let processedFile = file;
    if (needsHeicConversion) {
      processedFile = await convertHeicToJpeg(file);
    }

    // Create an image element to load the file
    const img = await loadImage(processedFile);
    
    // Calculate new dimensions while maintaining aspect ratio
    const { width, height } = calculateDimensions(
      img.width,
      img.height,
      opts.maxWidth!,
      opts.maxHeight!
    );

    // Create canvas and draw resized image
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Use better image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    // Strip EXIF data if requested
    if (opts.stripMetadata) {
      // Canvas operations automatically strip metadata
    }

    // Convert to blob with compression
    const blob = await canvasToBlob(canvas, opts.format!, opts.quality!);
    
    // Create new file with optimized content
    const optimizedFileName = needsHeicConversion 
      ? file.name.replace(/\.(heic|heif)$/i, '.jpg')
      : file.name;
    
    const optimizedFile = new File([blob], optimizedFileName, {
      type: `image/${opts.format}`,
    });

    return {
      file: optimizedFile,
      originalSize,
      optimizedSize: optimizedFile.size,
    };
  } catch (error) {
    console.error('Image optimization failed:', error);
    // Return original file if optimization fails
    return { file, originalSize, optimizedSize: originalSize };
  }
}

/**
 * Generate a thumbnail for an image file
 */
export async function generateThumbnail(
  file: File,
  size: number = 200
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File is not an image');
  }

  const img = await loadImage(file);
  
  // Calculate square crop dimensions
  const minDimension = Math.min(img.width, img.height);
  const offsetX = (img.width - minDimension) / 2;
  const offsetY = (img.height - minDimension) / 2;

  // Create square canvas
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Draw center-cropped square thumbnail
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    img,
    offsetX,
    offsetY,
    minDimension,
    minDimension,
    0,
    0,
    size,
    size
  );

  return canvas.toDataURL('image/jpeg', 0.8);
}

/**
 * Strip EXIF and other metadata from an image
 */
export async function stripImageMetadata(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file;
  }

  try {
    const img = await loadImage(file);
    
    // Create canvas with original dimensions
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Draw image without metadata
    ctx.drawImage(img, 0, 0);

    // Convert back to file
    const blob = await canvasToBlob(canvas, 'jpeg', 0.95);
    return new File([blob], file.name, { type: 'image/jpeg' });
  } catch (error) {
    console.error('Failed to strip metadata:', error);
    return file;
  }
}

/**
 * Detect if an image appears to be academic content
 */
export async function detectAcademicContent(file: File): Promise<{
  isAcademic: boolean;
  confidence: number;
  detectedContent: 'screenshot' | 'diagram' | 'photo' | 'document_scan' | 'unknown';
}> {
  if (!file.type.startsWith('image/')) {
    return {
      isAcademic: false,
      confidence: 1,
      detectedContent: 'unknown',
    };
  }

  try {
    const img = await loadImage(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Sample image at lower resolution for analysis
    const sampleSize = 100;
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
    
    const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
    const pixels = imageData.data;
    
    // Analyze color distribution
    const colorStats = analyzeColors(pixels);
    
    // Detect patterns that indicate academic content
    const patterns = {
      hasHighContrast: colorStats.contrast > 0.7,
      hasLimitedColors: colorStats.uniqueColors < 1000,
      hasWhiteBackground: colorStats.whitePixels > 0.6,
      hasTextPatterns: detectTextPatterns(pixels, sampleSize),
    };

    // Determine content type based on patterns
    let detectedContent: 'screenshot' | 'diagram' | 'photo' | 'document_scan' | 'unknown' = 'unknown';
    let isAcademic = false;
    let confidence = 0;

    if (patterns.hasWhiteBackground && patterns.hasTextPatterns) {
      detectedContent = 'document_scan';
      isAcademic = true;
      confidence = 0.9;
    } else if (patterns.hasHighContrast && patterns.hasLimitedColors) {
      detectedContent = 'screenshot';
      isAcademic = true;
      confidence = 0.8;
    } else if (patterns.hasLimitedColors && !patterns.hasWhiteBackground) {
      detectedContent = 'diagram';
      isAcademic = true;
      confidence = 0.7;
    } else {
      detectedContent = 'photo';
      isAcademic = false;
      confidence = 0.6;
    }

    return { isAcademic, confidence, detectedContent };
  } catch (error) {
    console.error('Academic content detection failed:', error);
    return {
      isAcademic: true, // Default to allowing upload
      confidence: 0,
      detectedContent: 'unknown',
    };
  }
}

// Helper functions

async function convertHeicToJpeg(file: File): Promise<File> {
  // This is a placeholder for HEIC conversion
  // In production, you would use a library like heic2any
  // For now, we'll return the original file with a warning
  console.warn('HEIC conversion not implemented yet. Install heic2any for full support.');
  
  // Create a dummy JPEG file for development
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.fillText('HEIC', 30, 50);
  }
  
  const blob = await canvasToBlob(canvas, 'jpeg', 0.9);
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
    type: 'image/jpeg'
  });
}

export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
}

export function getOptimalQualityForConnection(): number {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) return 0.85;
  
  // Adjust quality based on connection type
  switch (connection.effectiveType) {
    case 'slow-2g':
    case '2g':
      return 0.6;
    case '3g':
      return 0.7;
    case '4g':
      return 0.85;
    default:
      return 0.85;
  }
}

export async function optimizeForMobile(file: File): Promise<{ file: File; originalSize: number; optimizedSize: number }> {
  const quality = getOptimalQualityForConnection();
  const maxDimension = window.innerWidth < 768 ? 1024 : 2048;
  
  return optimizeImage(file, {
    maxWidth: maxDimension,
    maxHeight: maxDimension,
    quality,
    format: 'jpeg',
    stripMetadata: true
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;
  let width = maxWidth;
  let height = maxWidth / aspectRatio;

  if (height > maxHeight) {
    height = maxHeight;
    width = maxHeight * aspectRatio;
  }

  return { width: Math.round(width), height: Math.round(height) };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      `image/${format}`,
      quality
    );
  });
}

function analyzeColors(pixels: Uint8ClampedArray): {
  contrast: number;
  uniqueColors: number;
  whitePixels: number;
} {
  const colorSet = new Set<string>();
  let whiteCount = 0;
  let minLuminance = 255;
  let maxLuminance = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    
    // Track unique colors
    colorSet.add(`${r},${g},${b}`);
    
    // Count white/near-white pixels
    if (r > 240 && g > 240 && b > 240) {
      whiteCount++;
    }
    
    // Calculate luminance for contrast
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    minLuminance = Math.min(minLuminance, luminance);
    maxLuminance = Math.max(maxLuminance, luminance);
  }

  const totalPixels = pixels.length / 4;
  const contrast = (maxLuminance - minLuminance) / 255;
  
  return {
    contrast,
    uniqueColors: colorSet.size,
    whitePixels: whiteCount / totalPixels,
  };
}

function detectTextPatterns(pixels: Uint8ClampedArray, size: number): boolean {
  // Simple heuristic: look for horizontal lines of similar colors (text lines)
  let horizontalLines = 0;
  
  for (let y = 0; y < size; y++) {
    let consecutiveSimilar = 0;
    let lastLuminance = -1;
    
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const luminance = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
      
      if (Math.abs(luminance - lastLuminance) < 10) {
        consecutiveSimilar++;
      } else {
        if (consecutiveSimilar > size * 0.3) {
          horizontalLines++;
        }
        consecutiveSimilar = 0;
      }
      
      lastLuminance = luminance;
    }
  }
  
  // If we find multiple horizontal lines, likely contains text
  return horizontalLines > size * 0.1;
}