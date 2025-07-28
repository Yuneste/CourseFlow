// Optimized Framer Motion imports
// Only import what we actually use to reduce bundle size

export { 
  motion,
  AnimatePresence,
  type MotionProps,
  type AnimatePresenceProps 
} from 'framer-motion';

// Common animation variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const slideIn = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 }
};

export const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 }
};

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
};

// Animation presets
export const defaultTransition = {
  duration: 0.3,
  ease: 'easeInOut'
};

export const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30
};