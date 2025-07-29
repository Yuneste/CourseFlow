'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface UnifiedBackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'vibrant';
  showDecorations?: boolean;
}

export function UnifiedBackground({ 
  children, 
  className,
  variant = 'default',
  showDecorations = true 
}: UnifiedBackgroundProps) {
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-background via-accent/20 to-secondary/30",
      className
    )}>
      {/* Decorative elements matching dashboard */}
      {showDecorations && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"
          />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Reusable card component matching dashboard style
export function UnifiedCard({ 
  children, 
  className,
  hover = true 
}: { 
  children: React.ReactNode; 
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn(
      "bg-card/95 backdrop-blur-sm border-border shadow-sm rounded-lg",
      hover && "hover:shadow-lg transition-all duration-300",
      className
    )}>
      {children}
    </div>
  );
}

// Reusable section wrapper
export function UnifiedSection({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn(
      "container mx-auto px-4 py-8",
      className
    )}>
      {children}
    </div>
  );
}