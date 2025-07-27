'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  FileText, 
  Brain, 
  FolderOpen, 
  Calendar, 
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface BenefitsShowcaseProps {
  onComplete: () => void;
}

const benefits = [
  {
    icon: FileText,
    title: "Smart File Organization",
    description: "CourseFlow automatically organizes your study materials by course, making everything easy to find.",
    animation: {
      initial: { scale: 0, rotate: -180 },
      animate: { scale: 1, rotate: 0 },
      transition: { type: "spring", stiffness: 260, damping: 20 }
    }
  },
  {
    icon: Brain,
    title: "AI-Powered Assistant",
    description: "Get instant help with your studies. Our AI understands your courses and provides personalized support.",
    animation: {
      initial: { x: -100, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      transition: { type: "spring", stiffness: 100 }
    }
  },
  {
    icon: FolderOpen,
    title: "All Your Materials in One Place",
    description: "Upload lecture notes, assignments, and resources. Access everything from any device.",
    animation: {
      initial: { y: 50, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: { duration: 0.5 }
    }
  },
  {
    icon: Calendar,
    title: "Stay on Track",
    description: "Never miss a deadline. CourseFlow helps you manage assignments and exam dates effortlessly.",
    animation: {
      initial: { scale: 0.5, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: { duration: 0.5 }
    }
  },
  {
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "Visualize your academic journey with insights and analytics about your study patterns.",
    animation: {
      initial: { rotateY: 180, opacity: 0 },
      animate: { rotateY: 0, opacity: 1 },
      transition: { duration: 0.6 }
    }
  }
];

export function BenefitsShowcase({ onComplete }: BenefitsShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const currentBenefit = benefits[currentIndex];
  const Icon = currentBenefit.icon;

  const handleNext = () => {
    if (currentIndex < benefits.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [currentIndex]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          
          <div className="relative h-full flex flex-col items-center justify-center p-8">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl w-full text-center"
            >
              <motion.div
                {...currentBenefit.animation}
                className="mb-8 inline-flex"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse" />
                  <div className="relative bg-white rounded-full p-8 shadow-xl">
                    <Icon className="h-16 w-16 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold text-gray-900 mb-4"
              >
                {currentBenefit.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-gray-600 mb-12 max-w-lg mx-auto"
              >
                {currentBenefit.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-2 mb-8"
              >
                {benefits.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-8 bg-blue-600'
                        : index < currentIndex
                        ? 'w-2 bg-blue-300'
                        : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-4"
              >
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="px-6"
                >
                  Skip
                </Button>
                <Button
                  onClick={handleNext}
                  className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  {currentIndex === benefits.length - 1 ? (
                    <>
                      Get Started
                      <Sparkles className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-8 text-sm text-gray-500"
            >
              Press Space or → to continue
            </motion.div>
          </div>

          {/* Animated background elements */}
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
            className="absolute top-20 left-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-20"
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
            className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// CSS for grid pattern
const gridPatternStyles = `
  .bg-grid-pattern {
    background-image: 
      linear-gradient(to right, #80808012 1px, transparent 1px),
      linear-gradient(to bottom, #80808012 1px, transparent 1px);
    background-size: 50px 50px;
  }
`;

export function BenefitsShowcaseStyles() {
  return <style dangerouslySetInnerHTML={{ __html: gridPatternStyles }} />;
}