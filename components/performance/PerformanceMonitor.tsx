'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

// Web Vitals monitoring
interface WebVitalsData {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  INP?: number; // Interaction to Next Paint (replaced FID)
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

export function useWebVitals() {
  const [vitals, setVitals] = useState<WebVitalsData>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamically import web-vitals
    import('web-vitals').then(({ onFCP, onLCP, onINP, onCLS, onTTFB }) => {
      onFCP((metric) => setVitals(prev => ({ ...prev, FCP: metric.value })));
      onLCP((metric) => setVitals(prev => ({ ...prev, LCP: metric.value })));
      onINP((metric) => setVitals(prev => ({ ...prev, INP: metric.value })));
      onCLS((metric) => setVitals(prev => ({ ...prev, CLS: metric.value })));
      onTTFB((metric) => setVitals(prev => ({ ...prev, TTFB: metric.value })));
    });
  }, []);

  return vitals;
}

// FPS Monitor
export function useFPSMonitor() {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationId: number;

    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime.current + 1000) {
        setFps(Math.round((frameCount.current * 1000) / (currentTime - lastTime.current)));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return fps;
}

// Memory usage monitor
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export function useMemoryMonitor() {
  const [memory, setMemory] = useState<MemoryInfo | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateMemory = () => {
      // @ts-ignore - performance.memory is not in TypeScript types
      if (performance.memory) {
        setMemory({
          // @ts-ignore
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          // @ts-ignore
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          // @ts-ignore
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        });
      }
    };

    updateMemory();
    const interval = setInterval(updateMemory, 1000);

    return () => clearInterval(interval);
  }, []);

  return memory;
}

// Performance monitor component
interface PerformanceMonitorProps {
  show?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

export function PerformanceMonitor({
  show = process.env.NODE_ENV === 'development',
  position = 'bottom-right',
  className
}: PerformanceMonitorProps) {
  const fps = useFPSMonitor();
  const memory = useMemoryMonitor();
  const vitals = useWebVitals();

  if (!show) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div
      className={cn(
        'fixed z-50 bg-black/80 backdrop-blur-sm text-white p-3 rounded-lg font-mono text-xs space-y-2',
        positionClasses[position],
        className
      )}
    >
      <div className="font-bold text-center mb-2">Performance</div>
      
      {/* FPS */}
      <div className="flex justify-between gap-4">
        <span>FPS:</span>
        <span className={getFPSColor(fps)}>{fps}</span>
      </div>

      {/* Memory */}
      {memory && (
        <>
          <div className="flex justify-between gap-4">
            <span>Memory:</span>
            <span>{formatBytes(memory.usedJSHeapSize)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Heap:</span>
            <span className="text-xs">
              {formatBytes(memory.totalJSHeapSize)} / {formatBytes(memory.jsHeapSizeLimit)}
            </span>
          </div>
        </>
      )}

      {/* Web Vitals */}
      {Object.keys(vitals).length > 0 && (
        <div className="border-t border-white/20 pt-2 mt-2">
          <div className="font-bold mb-1">Web Vitals</div>
          {vitals.FCP && (
            <div className="flex justify-between gap-4">
              <span>FCP:</span>
              <span>{vitals.FCP.toFixed(0)}ms</span>
            </div>
          )}
          {vitals.LCP && (
            <div className="flex justify-between gap-4">
              <span>LCP:</span>
              <span>{vitals.LCP.toFixed(0)}ms</span>
            </div>
          )}
          {vitals.CLS && (
            <div className="flex justify-between gap-4">
              <span>CLS:</span>
              <span>{vitals.CLS.toFixed(3)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Performance profiler hook
export function usePerformanceProfiler(name: string) {
  const startTime = useRef<number>();

  useEffect(() => {
    startTime.current = performance.now();

    return () => {
      if (startTime.current) {
        const endTime = performance.now();
        const duration = endTime - startTime.current;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
        }

        // You can send this to analytics
        if (typeof window !== 'undefined' && 'performance' in window) {
          performance.measure(name, {
            start: startTime.current,
            end: endTime
          });
        }
      }
    };
  }, [name]);
}

// Render performance tracker
export function useRenderTracker(componentName: string) {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const lastRenderTime = useRef<number>();

  useEffect(() => {
    renderCount.current++;
    const now = performance.now();

    if (lastRenderTime.current) {
      const timeSinceLastRender = now - lastRenderTime.current;
      renderTimes.current.push(timeSinceLastRender);
      
      // Keep only last 10 render times
      if (renderTimes.current.length > 10) {
        renderTimes.current.shift();
      }
    }

    lastRenderTime.current = now;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Render] ${componentName}: render #${renderCount.current}`);
    }
  });

  return {
    renderCount: renderCount.current,
    averageRenderTime: renderTimes.current.length > 0
      ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
      : 0
  };
}