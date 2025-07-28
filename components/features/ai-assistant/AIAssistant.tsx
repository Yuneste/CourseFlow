'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import type { Course, File as FileType } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  courseContext?: string;
  fileContext?: string[];
}

interface AIAssistantProps {
  courseId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AIAssistant({ courseId, isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI study assistant. I can help you understand your course materials, answer questions, and create study resources. What would you like help with today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { courses, files } = useAppStore();
  const currentCourse = courses.find(c => c.id === courseId);
  const courseFiles = files.filter(f => f.course_id === courseId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      courseContext: currentCourse?.name,
      fileContext: courseFiles.map(f => f.display_name),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getSimulatedResponse(input, currentCourse, courseFiles),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const getSimulatedResponse = (query: string, course?: Course, files?: FileType[]): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('flashcard') || lowerQuery.includes('flash card')) {
      return `I'll help you create flashcards${course ? ` for ${course.name}` : ''}! Based on your materials, here are some key concepts to study:\n\n1. **Key Concept 1**: Definition or explanation\n2. **Key Concept 2**: Important formula or principle\n3. **Key Concept 3**: Critical relationship or rule\n\nWould you like me to create more flashcards or focus on a specific topic?`;
    }
    
    if (lowerQuery.includes('explain') || lowerQuery.includes('what is')) {
      return `Let me explain that concept${course ? ` from ${course.name}` : ''} for you.\n\nThis is a fundamental concept that relates to...\n\nKey points to remember:\n- Point 1: Important detail\n- Point 2: Another crucial aspect\n- Point 3: How it connects to other topics\n\nWould you like me to go deeper into any specific aspect?`;
    }
    
    if (lowerQuery.includes('quiz') || lowerQuery.includes('test')) {
      return `I'll help you prepare for your quiz${course ? ` in ${course.name}` : ''}! Here are some practice questions:\n\n1. What is the main principle behind...?\n2. How does X relate to Y?\n3. Calculate or solve...\n\nWould you like me to provide answers or create more practice questions?`;
    }
    
    if (lowerQuery.includes('summary') || lowerQuery.includes('summarize')) {
      return `Here's a summary of the key topics${course ? ` in ${course.name}` : ''}${files && files.length > 0 ? ` based on your ${files.length} uploaded files` : ''}:\n\n**Main Topics:**\n1. Topic 1 - Core concepts and applications\n2. Topic 2 - Important formulas and methods\n3. Topic 3 - Practical examples and cases\n\n**Key Takeaways:**\n- Essential point 1\n- Essential point 2\n- Essential point 3\n\nWhat specific area would you like me to elaborate on?`;
    }
    
    return `I understand you're asking about "${query}"${course ? ` in the context of ${course.name}` : ''}. ${files && files.length > 0 ? `I have access to ${files.length} files you've uploaded. ` : ''}Let me help you with that.\n\nCould you provide more details about what specific aspect you'd like help with? For example:\n- Understanding a concept\n- Creating study materials\n- Solving practice problems\n- Preparing for exams`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed bottom-4 right-4 z-50 w-96 h-[600px] shadow-2xl"
        >
          <Card className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#FA8072] to-[#FF6B6B] text-white">
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">AI Study Assistant</h3>
                  {currentCourse && (
                    <p className="text-xs opacity-90">{currentCourse.emoji} {currentCourse.name}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-[#FA8072] text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-1 mb-1">
                        <Sparkles className="h-3 w-3" />
                        <span className="text-xs font-medium">AI Assistant</span>
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin text-[#FA8072]" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your studies..."
                  className="flex-1 resize-none rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FA8072]"
                  rows={2}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-[#FA8072] hover:bg-[#FF6B6B]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}