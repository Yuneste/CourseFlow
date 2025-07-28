'use client';

import { useState } from 'react';
import { Bot, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AIAssistant } from './AIAssistant';

interface AIAssistantFABProps {
  courseId?: string;
}

export function AIAssistantFAB({ courseId }: AIAssistantFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-[#FA8072] to-[#FF6B6B] hover:from-[#FF6B6B] hover:to-[#FA8072] text-white"
        >
          <Bot className="h-6 w-6" />
        </Button>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap"
          >
            Need help? Ask your AI assistant!
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0 h-0 border-l-4 border-l-gray-800 border-y-4 border-y-transparent" />
          </motion.div>
        )}
      </motion.div>

      <AIAssistant 
        courseId={courseId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}