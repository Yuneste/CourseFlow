'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

// Safe motion components that only animate after hydration
export function SafeMotion({ children, ...props }: React.ComponentProps<typeof motion.div>) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR and initial hydration, render without animations
  if (!isClient) {
    return <div {...props}>{children}</div>;
  }

  return <motion.div {...props}>{children}</motion.div>;
}

export function SafeAnimatePresence({ children, ...props }: React.ComponentProps<typeof AnimatePresence>) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR and initial hydration, render children directly
  if (!isClient) {
    return <>{children}</>;
  }

  return <AnimatePresence {...props}>{children}</AnimatePresence>;
}