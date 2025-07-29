'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps extends Omit<ImageProps, 'onLoad'> {
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  blurDataURL?: string;
  aspectRatio?: number;
  onLoad?: () => void;
  showLoader?: boolean;
}

export function LazyImage({
  src,
  alt,
  className,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  blurDataURL,
  aspectRatio,
  onLoad,
  showLoader = true,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
  };

  if (error && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div 
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {showLoader && !isLoaded && isInView && (
        <Skeleton className="absolute inset-0" />
      )}
      
      {isInView && (
        <Image
          src={src}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL}
          {...props}
        />
      )}
    </div>
  );
}

// Optimized background image component
interface LazyBackgroundProps {
  src: string;
  className?: string;
  children?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallbackColor?: string;
}

export function LazyBackground({
  src,
  className,
  children,
  threshold = 0.1,
  rootMargin = '100px',
  fallbackColor = 'var(--background)'
}: LazyBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (isInView && src) {
      const img = new window.Image();
      img.src = src;
      img.onload = () => setIsLoaded(true);
    }
  }, [isInView, src]);

  return (
    <div
      ref={ref}
      className={cn('relative', className)}
      style={{
        backgroundColor: !isLoaded ? fallbackColor : undefined,
        backgroundImage: isLoaded ? `url(${src})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.3s ease-in-out'
      }}
    >
      {children}
    </div>
  );
}