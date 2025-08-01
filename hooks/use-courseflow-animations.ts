/**
 * CourseFlow Animation Hook
 * Provides consistent animation variants for Framer Motion
 */

import { Variants } from 'framer-motion';

export const useCourseFlowAnimations = () => {
  const fadeInUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const slideInLeft: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  const slideInRight: Variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const scaleIn: Variants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  };

  const staggerContainer: Variants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const staggerItem: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const cardHover = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -4 },
    tap: { scale: 0.98 },
  };

  const buttonHover = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const glowPulse: Variants = {
    initial: { opacity: 0.5 },
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return {
    // Basic animations
    fadeInUp,
    fadeIn,
    slideInLeft,
    slideInRight,
    scaleIn,
    
    // Container animations
    staggerContainer,
    staggerItem,
    
    // Interactive animations
    cardHover,
    buttonHover,
    
    // Special effects
    glowPulse,
    
    // Default transition
    defaultTransition: {
      duration: 0.5,
      ease: "easeOut",
    },
    
    // Quick transition
    quickTransition: {
      duration: 0.3,
      ease: "easeOut",
    },
    
    // Smooth transition
    smoothTransition: {
      duration: 0.8,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  };
};