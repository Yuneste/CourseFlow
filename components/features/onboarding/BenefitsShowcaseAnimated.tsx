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
  BarChart3,
  Link,
  BookOpenCheck,
  Youtube,
  FileVideo,
  GraduationCap,
  Users,
  UserPlus,
  Share2
} from 'lucide-react';

interface BenefitsShowcaseProps {
  onComplete: () => void;
}

// Animated demonstration components for each benefit
export const FileOrganizationDemo = () => {
  const [detectedText, setDetectedText] = useState('');
  const [movedToFolder, setMovedToFolder] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setDetectedText('binomial formula'), 1500);
    const timer2 = setTimeout(() => setMovedToFolder(true), 2500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="relative w-full h-64 mx-auto">
      {/* File with text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-40 h-48 bg-white rounded-lg shadow-lg p-3"
      >
        <div className="text-xs text-gray-400 mb-2">lecture_notes.pdf</div>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="h-1 bg-gray-200 rounded w-full"></div>
          <div className="h-1 bg-gray-200 rounded w-3/4"></div>
          <motion.div 
            className="relative"
            animate={detectedText ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className={`${detectedText ? 'bg-yellow-300' : ''} px-1 rounded inline-block`}>
              binomial formula
            </div>
          </motion.div>
          <div className="h-1 bg-gray-200 rounded w-full"></div>
          <div className="h-1 bg-gray-200 rounded w-2/3"></div>
        </div>
      </motion.div>

      {/* AI Scanner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{ rotate: detectedText ? 0 : 360 }}
          transition={{ duration: detectedText ? 0.5 : 2, repeat: detectedText ? 0 : Infinity, ease: "linear" }}
          className="relative"
        >
          <Cpu className="h-12 w-12 text-[#FA8072]" />
          {detectedText && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#FA8072] text-white text-xs px-2 py-1 rounded"
            >
              Found: Math!
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Moving text */}
      {movedToFolder && (
        <motion.div
          initial={{ x: -200, y: 0, opacity: 1 }}
          animate={{ x: 200, y: -20, opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-semibold text-[#FA8072]"
        >
          binomial formula →
        </motion.div>
      )}

      {/* Organized folders */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute right-0 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-2"
      >
        {['Math', 'CS', 'Bio', 'Eng'].map((subject, i) => (
          <motion.div
            key={subject}
            animate={movedToFolder && subject === 'Math' ? { scale: [1, 1.2, 1] } : {}}
            className={`w-16 h-16 ${movedToFolder && subject === 'Math' ? 'bg-[#FA8072] text-white' : 'bg-[#FFE4E1]'} rounded-lg shadow-md flex flex-col items-center justify-center transition-colors`}
          >
            <FolderCheck className={`h-6 w-6 ${movedToFolder && subject === 'Math' ? 'text-white' : 'text-[#FA8072]'}`} />
            <span className={`text-xs mt-1 ${movedToFolder && subject === 'Math' ? 'text-white font-semibold' : 'text-gray-700'}`}>{subject}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const AIAssistantDemo = () => {
  const [currentSubject, setCurrentSubject] = useState(0);
  const [showFlashcards, setShowFlashcards] = useState(false);
  
  const subjects = [
    {
      messages: [
        { text: 'Help with derivatives?', isUser: true },
        { text: 'f\'(x) = 2x for f(x) = x²', isUser: false },
        { text: 'Create flashcards?', isUser: true },
      ],
      flashcards: ['Derivative of x²', 'Power rule', 'Chain rule']
    },
    {
      messages: [
        { text: 'Explain photosynthesis', isUser: true },
        { text: 'Plants convert CO₂ + H₂O → glucose', isUser: false },
        { text: 'Quiz me!', isUser: true },
      ],
      flashcards: ['Chloroplast', 'Light reaction', 'Calvin cycle']
    },
    {
      messages: [
        { text: 'Binary tree traversal?', isUser: true },
        { text: 'Inorder: Left→Root→Right', isUser: false },
        { text: 'Practice cards?', isUser: true },
      ],
      flashcards: ['Inorder', 'Preorder', 'BFS vs DFS']
    }
  ];

  const current = subjects[currentSubject];

  useEffect(() => {
    const cycleTimer = setInterval(() => {
      setCurrentSubject((prev) => (prev + 1) % subjects.length);
      setShowFlashcards(false);
    }, 6000);

    const flashcardTimer = setTimeout(() => {
      setShowFlashcards(true);
    }, 3000);
    
    return () => {
      clearInterval(cycleTimer);
      clearTimeout(flashcardTimer);
    };
  }, [currentSubject]);

  return (
    <div className="relative w-full h-64 mx-auto flex gap-4">
      {/* Chat Section */}
      <motion.div
        key={currentSubject}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 bg-white rounded-lg shadow-lg p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Bot className="h-6 w-6 text-[#FA8072]" />
          <span className="text-sm font-semibold">AI Assistant</span>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {current.messages.map((msg, i) => (
              <motion.div
                key={`${currentSubject}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.8 }}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`px-3 py-1.5 rounded-lg text-xs max-w-[80%] ${
                  msg.isUser 
                    ? 'bg-gray-200 text-gray-700' 
                    : 'bg-[#FA8072] text-white'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Flashcards Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: showFlashcards ? 1 : 0, scale: showFlashcards ? 1 : 0 }}
        transition={{ delay: 0.2 }}
        className="w-32 space-y-2"
      >
        <div className="text-xs font-semibold text-gray-600 mb-1">Generated Cards:</div>
        {current.flashcards.map((card, i) => (
          <motion.div
            key={`${currentSubject}-card-${i}`}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-gradient-to-r from-[#FA8072] to-[#FF6B6B] text-white p-2 rounded text-xs shadow-md"
          >
            {card}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const CloudStorageDemo = () => {
  const [syncActive, setSyncActive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSyncActive(prev => !prev);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const devices = [
    { name: 'Desktop', icon: '🖥️', position: 'bottom-0 left-0' },
    { name: 'Mobile', icon: '📱', position: 'bottom-0 right-0' },
    { name: 'Laptop', icon: '💻', position: 'bottom-0 left-1/2 -translate-x-1/2' }
  ];

  return (
    <div className="relative w-full h-64 mx-auto">
      {/* Cloud at top */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute top-0 left-1/2 -translate-x-1/2"
      >
        <Cloud className="h-20 w-20 text-[#FA8072]" />
        <motion.div
          animate={{ scale: syncActive ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-[#FA8072] rounded-full opacity-20 blur-xl"
        />
      </motion.div>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
        {devices.map((_, i) => {
          const angle = (i * 120 - 60) * Math.PI / 180;
          const startX = 50 + Math.cos(angle) * 35;
          const startY = 25;
          const endX = 50 + Math.cos(angle) * 35;
          const endY = 75;
          
          return (
            <motion.line
              key={i}
              x1={`${startX}%`}
              y1={`${startY}%`}
              x2={`${endX}%`}
              y2={`${endY}%`}
              stroke="#FA8072"
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: syncActive ? [0.3, 0.8, 0.3] : 0.3,
                strokeDashoffset: syncActive ? [0, -10] : 0
              }}
              transition={{ 
                pathLength: { delay: 0.5 + i * 0.1, duration: 0.5 },
                opacity: { duration: 2, repeat: Infinity },
                strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" }
              }}
            />
          );
        })}
      </svg>

      {/* Devices at bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-8">
        {devices.map((device, i) => (
          <motion.div
            key={device.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={syncActive ? { scale: [1, 1.1, 1] } : {}}
              transition={{ delay: i * 0.1 }}
              className="text-4xl mb-1"
            >
              {device.icon}
            </motion.div>
            <span className="text-xs text-gray-600">{device.name}</span>
            {syncActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute -top-4 bg-green-500 text-white text-xs px-2 py-0.5 rounded"
              >
                Synced!
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Floating files */}
      <AnimatePresence>
        {syncActive && [0, 1, 2].map((i) => (
          <motion.div
            key={`file-${i}`}
            initial={{ 
              x: i === 0 ? -100 : i === 1 ? 100 : 0,
              y: 150,
              opacity: 0 
            }}
            animate={{ 
              x: 0,
              y: -20,
              opacity: [0, 1, 0]
            }}
            transition={{ 
              delay: i * 0.3,
              duration: 1.5
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2"
          >
            <FileText className="h-4 w-4 text-[#FA8072]" />
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

export const ResourceRecommendationDemo = () => {
  const [showResources, setShowResources] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  useEffect(() => {
    const timer1 = setTimeout(() => setSelectedCourse(0), 1000);
    const timer2 = setTimeout(() => setShowResources(true), 2000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const courses = [
    { name: 'Calculus II', emoji: '📐', resources: ['Khan Academy', 'MIT OCW', 'YouTube'] },
    { name: 'Data Structures', emoji: '💻', resources: ['Coursera', 'LeetCode', 'GeeksforGeeks'] },
    { name: 'Organic Chem', emoji: '🧪', resources: ['ChemLibre', 'YouTube', 'Study.com'] }
  ];

  const resourceIcons = {
    'Khan Academy': '🎓',
    'MIT OCW': '🏛️',
    'YouTube': '📺',
    'Coursera': '🎯',
    'LeetCode': '💡',
    'GeeksforGeeks': '🚀',
    'ChemLibre': '⚗️',
    'Study.com': '📚'
  };

  return (
    <div className="relative w-full h-64 mx-auto">
      <div className="flex gap-8 items-start justify-center h-full">
        {/* Your Courses */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Your Courses</h3>
          {courses.map((course, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedCourse(i)}
              className={`cursor-pointer p-3 rounded-lg transition-all ${
                selectedCourse === i 
                  ? 'bg-[#FA8072] text-white shadow-lg scale-105' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{course.emoji}</span>
                <span className="text-sm font-medium">{course.name}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Brain */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="relative"
        >
          <motion.div
            animate={selectedCourse !== null ? { rotate: 360 } : {}}
            transition={{ duration: 1 }}
          >
            <Brain className="h-12 w-12 text-[#FA8072]" />
          </motion.div>
          {selectedCourse !== null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-[#FA8072] rounded-full opacity-20 blur-xl"
            />
          )}
        </motion.div>

        {/* Recommended Resources */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Recommended Resources</h3>
          <AnimatePresence mode="wait">
            {showResources && selectedCourse !== null && (
              <motion.div
                key={selectedCourse}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-2"
              >
                {courses[selectedCourse].resources.map((resource, i) => (
                  <motion.div
                    key={resource}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 p-2 bg-gradient-to-r from-[#FFE4E1] to-white rounded-lg shadow-sm"
                  >
                    <span className="text-xl">{resourceIcons[resource as keyof typeof resourceIcons]}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700">{resource}</div>
                      <div className="text-xs text-gray-500">Free resource</div>
                    </div>
                    <Link className="h-4 w-4 text-[#FA8072]" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export const CollaborationDemo = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFiles, setShowFiles] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowNotifications(true), 1000);
    const timer2 = setTimeout(() => setShowFiles(true), 2000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const users = [
    { name: 'Alex', avatar: '👤', color: '#FA8072' },
    { name: 'Sarah', avatar: '👩', color: '#FF6B6B' },
    { name: 'Mike', avatar: '👨', color: '#FFB6B0' },
    { name: 'Emma', avatar: '👱‍♀️', color: '#FFA07A' }
  ];

  const notifications = [
    { user: 'Sarah', action: 'shared notes', file: 'Lecture_15.pdf' },
    { user: 'Mike', action: 'added flashcards', file: 'Chapter_8' },
    { user: 'Emma', action: 'completed quiz', file: 'Quiz_3' }
  ];

  return (
    <div className="relative w-full h-64 mx-auto">
      <div className="flex gap-8 items-center justify-center h-full">
        {/* Study Group */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg p-6 w-64"
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-[#FA8072]" />
              <span className="font-semibold text-sm">Study Group: CS 101</span>
            </div>
            
            {/* User avatars */}
            <div className="flex -space-x-2 mb-4">
              {users.map((user, i) => (
                <motion.div
                  key={user.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 border-white"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.avatar}
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                  />
                </motion.div>
              ))}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white hover:bg-gray-300 transition-colors"
              >
                <UserPlus className="h-4 w-4 text-gray-600" />
              </motion.button>
            </div>

            {/* Activity feed */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  {notifications.map((notif, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="text-xs text-gray-600 flex items-center gap-1"
                    >
                      <span className="font-semibold">{notif.user}</span>
                      <span>{notif.action}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Shared Files */}
        <AnimatePresence>
          {showFiles && (
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring' }}
              className="relative"
            >
              <Share2 className="h-12 w-12 text-[#FA8072]" />
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    scale: 1,
                    x: (i - 1) * 50,
                    y: -30
                  }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="absolute top-0 left-1/2 -translate-x-1/2"
                >
                  <FileText className="h-6 w-6 text-[#FA8072]" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shared folder */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#FFE4E1] to-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <FolderOpen className="h-5 w-5 text-[#FA8072]" />
            <span className="font-semibold text-sm">Shared Materials</span>
          </div>
          
          <div className="space-y-2">
            {['Lecture Notes', 'Practice Problems', 'Study Guides', 'Past Exams'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-2 text-xs text-gray-700"
              >
                <motion.div
                  animate={showFiles ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ delay: i * 0.2 }}
                >
                  <FileText className="h-4 w-4 text-[#FA8072]" />
                </motion.div>
                <span>{item}</span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="ml-auto text-[10px] text-gray-500"
                >
                  {4 - i} users
                </motion.span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const ProgressTrackerDemo = () => {
  const [showImprovement, setShowImprovement] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowImprovement(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const grades = [
    { subject: 'Mathematics', before: 'C+', after: 'A-', beforeNum: 65, afterNum: 85 },
    { subject: 'Computer Science', before: 'B', after: 'A', beforeNum: 75, afterNum: 92 },
    { subject: 'Biology', before: 'C', after: 'B+', beforeNum: 60, afterNum: 80 }
  ];

  return (
    <div className="relative w-full h-64 mx-auto flex gap-6 items-center justify-center">
      {/* Before CourseFlow */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gray-100 rounded-lg shadow-lg p-4 w-48"
      >
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Before CourseFlow</h3>
        <div className="space-y-2">
          {grades.map((grade, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-xs text-gray-600">{grade.subject}:</span>
              <span className="text-lg font-bold text-red-500">{grade.before}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-500">GPA: 2.3</span>
        </div>
      </motion.div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="text-[#FA8072]"
      >
        <ChevronRight className="h-8 w-8" />
      </motion.div>

      {/* After CourseFlow */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-[#FFE4E1] to-white rounded-lg shadow-lg p-4 w-48"
      >
        <h3 className="text-sm font-semibold text-[#FA8072] mb-3">With CourseFlow</h3>
        <div className="space-y-2">
          {grades.map((grade, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-xs text-gray-600">{grade.subject}:</span>
              <div className="flex items-center gap-1">
                {showImprovement && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-lg font-bold text-green-600"
                  >
                    {grade.after}
                  </motion.span>
                )}
                {!showImprovement && (
                  <span className="text-lg font-bold text-gray-400">?</span>
                )}
                {showImprovement && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  </motion.div>
                )}
              </div>
            </div>
          ))}
        </div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: showImprovement ? 1 : 0 }}
          transition={{ delay: 1 }}
          className="mt-3 text-center"
        >
          <span className="text-xs font-semibold text-[#FA8072]">GPA: 3.6 ✨</span>
        </motion.div>
      </motion.div>

      {/* Improvement indicators */}
      {showImprovement && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-full"
        >
          +56% improvement!
        </motion.div>
      )}
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
    icon: Users,
    title: "Study Together with Friends",
    description: "Create study groups, share materials, and collaborate with classmates in real-time",
    Demo: CollaborationDemo
  },
  {
    icon: Link,
    title: "Smart Resource Recommendations",
    description: "Get personalized online resources automatically matched to your courses",
    Demo: ResourceRecommendationDemo
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