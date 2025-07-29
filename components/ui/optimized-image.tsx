'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallback?: string
  aspectRatio?: number
  showSkeleton?: boolean
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallback = '/images/placeholder.png',
  aspectRatio,
  showSkeleton = true,
  priority = false,
  quality = 75,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  const imageSrc = hasError ? fallback : src

  return (
    <div 
      className={cn('relative overflow-hidden', className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {showSkeleton && isLoading && (
        <Skeleton className="absolute inset-0" />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        quality={quality}
        {...props}
      />
    </div>
  )
}

// Blur data URL generator for placeholder
export function getBlurDataURL(width: number = 10, height: number = 10): string {
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null
  if (!canvas) return ''
  
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  
  // Create a gradient for the blur placeholder
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#ECF0C0')
  gradient.addColorStop(1, '#F0C4C0')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL()
}

// Responsive image component with multiple sizes
export function ResponsiveImage({
  src,
  alt,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      sizes={sizes}
      style={{
        width: '100%',
        height: 'auto',
      }}
      {...props}
    />
  )
}

// Avatar component with optimization
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
  fallback = '/images/default-avatar.png',
}: {
  src?: string
  alt: string
  size?: number
  className?: string
  fallback?: string
}) {
  return (
    <OptimizedImage
      src={src || fallback}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      fallback={fallback}
      showSkeleton={false}
    />
  )
}