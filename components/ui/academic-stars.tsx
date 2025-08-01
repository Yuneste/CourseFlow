'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  GraduationCap, 
  Lightbulb, 
  PenTool,
  FileText,
  Calculator,
  Microscope,
  Globe
} from 'lucide-react';

const academicIcons = [
  { Icon: BookOpen, color: 'from-blue-400 to-blue-600' },
  { Icon: GraduationCap, color: 'from-purple-400 to-purple-600' },
  { Icon: Lightbulb, color: 'from-yellow-400 to-yellow-600' },
  { Icon: PenTool, color: 'from-green-400 to-green-600' },
  { Icon: FileText, color: 'from-pink-400 to-pink-600' },
  { Icon: Calculator, color: 'from-indigo-400 to-indigo-600' },
  { Icon: Microscope, color: 'from-teal-400 to-teal-600' },
  { Icon: Globe, color: 'from-orange-400 to-orange-600' }
];

interface StarPosition {
  top: string;
  left: string;
  delay: number;
  duration: number;
  scale: number;
}

const starPositions: StarPosition[] = [
  { top: '15%', left: '10%', delay: 0, duration: 20, scale: 0.6 },
  { top: '25%', left: '80%', delay: 2, duration: 25, scale: 0.8 },
  { top: '60%', left: '20%', delay: 4, duration: 30, scale: 0.7 },
  { top: '70%', left: '75%', delay: 6, duration: 22, scale: 0.5 }
];

export function AcademicStars() {
  // Use deterministic selection for SSR compatibility
  const selectedIcons = React.useMemo(() => {
    // Select first 4 icons deterministically
    return academicIcons.slice(0, 4);
  }, []);

  // Generate deterministic star positions based on index
  const starDots = React.useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      top: `${(i * 37) % 100}%`,
      left: `${(i * 61) % 100}%`,
      duration: 2 + (i % 4)
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-gray-900" />
      
      {/* Subtle star dots for atmosphere */}
      <div className="absolute inset-0">
        {starDots.map((dot, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            style={{
              top: dot.top,
              left: dot.left,
              animation: `twinkle ${dot.duration}s infinite`
            }}
          />
        ))}
      </div>

      {/* Floating academic components */}
      {selectedIcons.map((item, index) => {
        const position = starPositions[index];
        const { Icon, color } = item;

        return (
          <motion.div
            key={index}
            className="absolute"
            style={{
              top: position.top,
              left: position.left,
              transform: `scale(${position.scale})`
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: position.scale,
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              opacity: { duration: 2, delay: position.delay },
              scale: { duration: 2, delay: position.delay },
              y: { 
                duration: position.duration, 
                repeat: Infinity,
                ease: "easeInOut"
              },
              rotate: {
                duration: position.duration * 0.8,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            {/* Glow effect */}
            <div className={`absolute -inset-8 bg-gradient-to-r ${color} opacity-30 blur-2xl rounded-full`} />
            
            {/* Icon container */}
            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 shadow-2xl">
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20 rounded-2xl`} />
              <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-white relative z-10" />
            </div>

            {/* Extra glow particles */}
            <div className="absolute -inset-4">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{
                    top: `${50 + (i - 1) * 30}%`,
                    left: `${50 + (i - 1) * 30}%`
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.5,
                    repeat: Infinity
                  }}
                />
              ))}
            </div>
          </motion.div>
        );
      })}

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}