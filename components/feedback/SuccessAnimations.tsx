'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trophy, Star, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

// Checkmark animation
interface CheckmarkAnimationProps {
  show: boolean;
  size?: number;
  className?: string;
  onComplete?: () => void;
}

export function CheckmarkAnimation({
  show,
  size = 80,
  className,
  onComplete
}: CheckmarkAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={cn('relative', className)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onAnimationComplete={onComplete}
        >
          <motion.div
            className="absolute inset-0 bg-green-500/20 rounded-full"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          <motion.div
            className="relative bg-green-500 rounded-full flex items-center justify-center"
            style={{ width: size, height: size }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5, times: [0, 0.5, 1] }}
          >
            <motion.div
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Check className="text-white" size={size * 0.5} />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Confetti effect
interface ConfettiEffectProps {
  trigger: boolean;
  duration?: number;
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
}

export function ConfettiEffect({
  trigger,
  duration = 3000,
  particleCount = 100,
  spread = 70,
  origin = { x: 0.5, y: 0.5 }
}: ConfettiEffectProps) {
  useEffect(() => {
    if (trigger && typeof window !== 'undefined') {
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread,
          origin: { x: 0, y: 0.5 },
          colors: ['#FA8072', '#FF6B6B', '#FFE4E1']
        });

        confetti({
          particleCount: 2,
          angle: 120,
          spread,
          origin: { x: 1, y: 0.5 },
          colors: ['#FA8072', '#FF6B6B', '#FFE4E1']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [trigger, duration, spread]);

  return null;
}

// Trophy animation
interface TrophyAnimationProps {
  show: boolean;
  className?: string;
  message?: string;
}

export function TrophyAnimation({
  show,
  className,
  message = 'Achievement Unlocked!'
}: TrophyAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={cn(
            'fixed top-20 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 z-50',
            className
          )}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Trophy className="h-12 w-12 text-yellow-500" />
            </motion.div>
            <div>
              <h3 className="font-bold text-lg">{message}</h3>
              <motion.div
                className="flex gap-1 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Sparkle effect
interface SparkleEffectProps {
  children: React.ReactNode;
  active?: boolean;
  color?: string;
  count?: number;
}

export function SparkleEffect({
  children,
  active = true,
  color = '#FA8072',
  count = 3
}: SparkleEffectProps) {
  return (
    <div className="relative inline-block">
      {children}
      {active && (
        <>
          {[...Array(count)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute pointer-events-none"
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 1
              }}
              animate={{
                x: [0, (i - 1) * 30],
                y: [0, -30 - i * 10],
                scale: [0, 1, 0],
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: 1,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 1
              }}
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <Sparkles
                className="h-4 w-4"
                style={{ color }}
              />
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
}

// Success message toast
interface SuccessToastProps {
  show: boolean;
  message: string;
  duration?: number;
  onClose?: () => void;
  position?: 'top' | 'bottom';
}

export function SuccessToast({
  show,
  message,
  duration = 3000,
  onClose,
  position = 'top'
}: SuccessToastProps) {
  useEffect(() => {
    if (show && duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={cn(
            'fixed left-1/2 transform -translate-x-1/2 z-50',
            position === 'top' ? 'top-4' : 'bottom-4'
          )}
          initial={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Check className="h-5 w-5" />
            </motion.div>
            <span className="font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Celebration modal
interface CelebrationModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: 'trophy' | 'star' | 'heart' | 'check';
}

export function CelebrationModal({
  show,
  onClose,
  title,
  message,
  icon = 'trophy'
}: CelebrationModalProps) {
  const icons = {
    trophy: Trophy,
    star: Star,
    heart: Heart,
    check: Check
  };

  const Icon = icons[icon];

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center max-w-sm">
              <motion.div
                className="mx-auto mb-6"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-[#FA8072] to-[#FF6B6B] rounded-full flex items-center justify-center">
                  <Icon className="h-10 w-10 text-white" />
                </div>
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-2">{title}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              
              <motion.button
                className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
          <ConfettiEffect trigger={true} />
        </>
      )}
    </AnimatePresence>
  );
}