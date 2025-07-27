'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  FileText, 
  Brain, 
  FolderOpen, 
  Calendar, 
  TrendingUp,
  Sparkles,
  Cpu,
  ScanLine,
  FolderCheck,
  Bot,
  MessageSquare,
  Upload,
  Cloud,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

interface BenefitsShowcaseProps {
  onComplete: () => void;
}

// Animated demonstration components for each benefit
const FileOrganizationDemo = () => {
  return (
    <div className="relative w-full h-64 mx-auto">
      {/* Computer screen */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-24 bg-gray-200 rounded-lg shadow-lg flex items-center justify-center"
      >
        <FileText className="h-8 w-8 text-gray-600" />
      </motion.div>

      {/* AI Scanner */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <Cpu className="h-12 w-12 text-[#FA8072]" />
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 bg-[#FA8072] rounded-full opacity-20"
          />
        </motion.div>
      </motion.div>

      {/* Scan lines */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ delay: 0.8, duration: 1, repeat: Infinity }}
        className="absolute left-32 top-1/2 -translate-y-1/2 w-24"
      >
        <ScanLine className="h-6 w-24 text-[#FA8072]" />
      </motion.div>

      {/* Organized folders */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute right-0 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-2"
      >
        {['Math', 'CS', 'Bio', 'Eng'].map((subject, i) => (
          <motion.div
            key={subject}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7 + i * 0.1 }}
            className="w-16 h-16 bg-[#FFE4E1] rounded-lg shadow-md flex flex-col items-center justify-center"
          >
            <FolderCheck className="h-6 w-6 text-[#FA8072]" />
            <span className="text-xs mt-1 text-gray-700">{subject}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const AIAssistantDemo = () => {
  const [messages, setMessages] = useState<string[]>([]);
  
  useEffect(() => {
    const timer1 = setTimeout(() => setMessages(['Help with calculus?']), 500);
    const timer2 = setTimeout(() => setMessages(prev => [...prev, 'Here\'s the solution...']), 1500);
    const timer3 = setTimeout(() => setMessages(prev => [...prev, 'Practice problems?']), 2500);
    const timer4 = setTimeout(() => setMessages(prev => [...prev, 'Try these exercises...']), 3500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="relative w-full h-64 mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0 bg-gray-100 rounded-lg shadow-lg p-4"
      >
        {/* AI Bot */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-4 left-4"
        >
          <Bot className="h-8 w-8 text-[#FA8072]" />
        </motion.div>

        {/* Chat messages */}
        <div className="mt-12 space-y-2">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`px-3 py-2 rounded-lg text-sm ${
                  i % 2 === 0 
                    ? 'bg-white text-gray-700' 
                    : 'bg-[#FA8072] text-white'
                }`}>
                  {msg}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const CloudStorageDemo = () => {
  return (
    <div className="relative w-full h-64 mx-auto">
      {/* Devices */}
      <div className="absolute inset-0 flex items-center justify-between">
        {['laptop', 'phone', 'tablet'].map((device, i) => (
          <motion.div
            key={device}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="w-20 h-20 bg-gray-200 rounded-lg shadow-lg flex items-center justify-center"
          >
            <FileText className="h-6 w-6 text-gray-600" />
          </motion.div>
        ))}
      </div>

      {/* Cloud in center */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <Cloud className="h-16 w-16 text-[#FA8072]" />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-[#FA8072] rounded-full opacity-20 blur-xl"
        />
      </motion.div>

      {/* Upload arrows */}
      <AnimatePresence>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              y: [0, -30, -60]
            }}
            transition={{ 
              delay: 1.2 + i * 0.5,
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 1.5
            }}
            className={`absolute ${
              i === 0 ? 'left-20' : i === 1 ? 'left-1/2 -translate-x-1/2' : 'right-20'
            } bottom-24`}
          >
            <Upload className="h-4 w-4 text-[#FA8072]" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const DeadlineTrackerDemo = () => {
  return (
    <div className="relative w-full h-64 mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-lg p-4 max-w-sm mx-auto"
      >
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-4">
          <Calendar className="h-6 w-6 text-[#FA8072]" />
          <span className="font-semibold">March 2024</span>
        </div>

        {/* Deadline items */}
        <div className="space-y-2">
          {[
            { task: 'Math Assignment', date: 'Mar 15', done: true },
            { task: 'CS Project', date: 'Mar 20', done: false },
            { task: 'Bio Lab Report', date: 'Mar 22', done: false }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.2 }}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={item.done ? {} : { scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {item.done ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-[#FA8072]" />
                  )}
                </motion.div>
                <span className="text-sm">{item.task}</span>
              </div>
              <span className="text-xs text-gray-500">{item.date}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const ProgressTrackerDemo = () => {
  return (
    <div className="relative w-full h-64 mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-6 w-6 text-[#FA8072]" />
          <span className="font-semibold">Your Progress</span>
        </div>

        {/* Animated progress bars */}
        <div className="space-y-3">
          {[
            { subject: 'Mathematics', progress: 75 },
            { subject: 'Computer Science', progress: 90 },
            { subject: 'Biology', progress: 60 }
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{item.subject}</span>
                <span className="text-[#FA8072]">{item.progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ delay: 0.5 + i * 0.2, duration: 1 }}
                  className="h-full bg-gradient-to-r from-[#FA8072] to-[#FF6B6B]"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const benefits = [
  {
    icon: FileText,
    title: "Smart File Organization",
    description: "Watch how AI automatically scans and organizes your files into the perfect structure",
    Demo: FileOrganizationDemo
  },
  {
    icon: Brain,
    title: "AI-Powered Assistant",
    description: "See how our AI helps you with instant answers and personalized study support",
    Demo: AIAssistantDemo
  },
  {
    icon: FolderOpen,
    title: "Access Anywhere",
    description: "Your files sync across all devices - laptop, phone, or tablet",
    Demo: CloudStorageDemo
  },
  {
    icon: Calendar,
    title: "Never Miss Deadlines",
    description: "Track assignments and get smart reminders before due dates",
    Demo: DeadlineTrackerDemo
  },
  {
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "Visualize your academic performance and study patterns",
    Demo: ProgressTrackerDemo
  }
];

export function BenefitsShowcaseAnimated({ onComplete }: BenefitsShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const currentBenefit = benefits[currentIndex];
  const Icon = currentBenefit.icon;
  const Demo = currentBenefit.Demo;

  const handleNext = useCallback(() => {
    if (currentIndex < benefits.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }
  }, [currentIndex, onComplete]);

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
  }, [handleNext]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-rose-50 via-white to-orange-50 overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          
          <div className="relative h-full flex flex-col items-center justify-center p-8">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl w-full"
            >
              {/* Title and description */}
              <div className="text-center mb-8">
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
                  className="text-xl text-gray-600 max-w-2xl mx-auto"
                >
                  {currentBenefit.description}
                </motion.p>
              </div>

              {/* Animated demonstration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-12"
              >
                <Demo />
              </motion.div>

              {/* Progress dots */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 mb-8"
              >
                {benefits.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-8 bg-[#FA8072]'
                        : index < currentIndex
                        ? 'w-2 bg-[#FFB6B0]'
                        : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </motion.div>

              {/* Navigation buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
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
                  className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all bg-[#FA8072] hover:bg-[#FF6B6B] text-white border-0"
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
              transition={{ delay: 0.7 }}
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
            className="absolute top-20 left-20 w-64 h-64 bg-[#FFB6B0] rounded-full blur-3xl opacity-20"
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
            className="absolute bottom-20 right-20 w-96 h-96 bg-[#FFDAB9] rounded-full blur-3xl opacity-20"
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