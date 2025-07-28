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

// Hook to check if mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

interface BenefitsShowcaseProps {
  onComplete: () => void;
}

// Animated demonstration components for each benefit
export const FileOrganizationDemo = () => {
  const [detectedText, setDetectedText] = useState('');
  const [movedToFolder, setMovedToFolder] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer1 = setTimeout(() => setDetectedText('binomial formula'), 1500);
    const timer2 = setTimeout(() => setMovedToFolder(true), 2500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="relative w-full h-48 sm:h-56 md:h-64 mx-auto">
      {/* File with text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`absolute left-0 top-1/2 -translate-y-1/2 ${isMobile ? 'w-28 h-36' : 'w-40 h-48'} bg-white rounded-lg shadow-lg p-2 sm:p-3`}
      >
        <div className="text-[10px] sm:text-xs text-gray-400 mb-1 sm:mb-2">lecture_notes.pdf</div>
        <div className="space-y-1 text-[10px] sm:text-xs text-gray-600">
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
          <Cpu className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 text-[#FA8072]" />
          {detectedText && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 bg-[#FA8072] text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded"
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
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs sm:text-sm font-semibold text-[#FA8072]"
        >
          binomial formula →
        </motion.div>
      )}

      {/* Organized folders */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className={`absolute right-0 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-1 sm:gap-2`}
      >
        {['Math', 'CS', 'Bio', 'Eng'].map((subject, i) => (
          <motion.div
            key={subject}
            animate={movedToFolder && subject === 'Math' ? { scale: [1, 1.2, 1] } : {}}
            className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} ${movedToFolder && subject === 'Math' ? 'bg-[#FA8072] text-white' : 'bg-[#FFE4E1]'} rounded-lg shadow-md flex flex-col items-center justify-center transition-colors`}
          >
            <FolderCheck className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} ${movedToFolder && subject === 'Math' ? 'text-white' : 'text-[#FA8072]'}`} />
            <span className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${movedToFolder && subject === 'Math' ? 'text-white font-semibold' : 'text-gray-700'}`}>{subject}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const AIAssistantDemo = () => {
  const [currentSubject, setCurrentSubject] = useState(0);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const isMobile = useIsMobile();
  
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
  }, [currentSubject, subjects.length]);

  return (
    <div className={`relative w-full ${isMobile ? 'h-80' : 'h-64'} mx-auto ${isMobile ? 'space-y-4' : 'flex gap-4'}`}>
      {/* Chat Section */}
      <motion.div
        key={currentSubject}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`${isMobile ? 'w-full' : 'flex-1'} bg-white rounded-lg shadow-lg p-3 sm:p-4`}
      >
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <Bot className="h-5 sm:h-6 w-5 sm:w-6 text-[#FA8072]" />
          <span className="text-xs sm:text-sm font-semibold">AI Assistant</span>
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
                <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs max-w-[80%] ${
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
        className={`${isMobile ? 'w-full' : 'w-32'} space-y-2`}
      >
        <div className="text-[10px] sm:text-xs font-semibold text-gray-600 mb-1">Generated Cards:</div>
        {current.flashcards.map((card, i) => (
          <motion.div
            key={`${currentSubject}-card-${i}`}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-gradient-to-r from-[#FA8072] to-[#FF6B6B] text-white p-1.5 sm:p-2 rounded text-[10px] sm:text-xs shadow-md"
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
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setInterval(() => {
      setSyncActive(prev => !prev);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const devices = [
    { name: 'Desktop', icon: '🖥️', position: { x: -120, y: 80, mobileX: -80, mobileY: 60 } },
    { name: 'Mobile', icon: '📱', position: { x: 0, y: 100, mobileX: 0, mobileY: 80 } },
    { name: 'Laptop', icon: '💻', position: { x: 120, y: 80, mobileX: 80, mobileY: 60 } }
  ];

  const fileTypes = [
    { icon: '📄', label: 'PDF', color: '#FF6B6B' },
    { icon: '🖼️', label: 'IMG', color: '#FA8072' },
    { icon: '📝', label: 'DOC', color: '#FFB6B0' }
  ];

  return (
    <div className="relative w-full h-48 sm:h-56 md:h-64 mx-auto">
      {/* Cloud at center */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-8"
      >
        <Cloud className="h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 text-[#FA8072]" />
        <motion.div
          animate={{ scale: syncActive ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-[#FA8072] rounded-full opacity-20 blur-xl"
        />
        {/* Cloud storage indicator */}
        <motion.div
          animate={{ opacity: syncActive ? 1 : 0.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] sm:text-xs font-semibold text-white"
        >
          Cloud
        </motion.div>
      </motion.div>

      {/* Tree structure connections with animated data */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" 
           refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#FA8072" />
          </marker>
        </defs>
        
        {devices.map((device, i) => {
          // Calculate line coordinates from device to cloud
          const x = isMobile ? device.position.mobileX : device.position.x;
          const y = isMobile ? device.position.mobileY : device.position.y;
          const centerX = 50; // Center of cloud (%)
          const centerY = 40; // Center of cloud (%)
          const deviceX = 50 + (x / 400) * 100; // Convert to percentage
          const deviceY = 50 + (y / 200) * 100; // Convert to percentage
          
          return (
            <g key={i}>
              {/* Main connection line */}
              <motion.path
                d={`M ${deviceX} ${deviceY} Q ${(centerX + deviceX) / 2} ${centerY + 10} ${centerX} ${centerY + 10}`}
                stroke="#FA8072"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: 0.4
                }}
                transition={{ 
                  delay: 0.5 + i * 0.2,
                  duration: 0.8
                }}
              />
              
              {/* Animated data particles flowing through the line */}
              <AnimatePresence>
                {syncActive && (
                  <motion.circle
                    r="4"
                    fill={fileTypes[i].color}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <animateMotion
                      dur="2s"
                      repeatCount="3"
                      path={`M ${deviceX} ${deviceY} Q ${(centerX + deviceX) / 2} ${centerY + 10} ${centerX} ${centerY + 10}`}
                    />
                  </motion.circle>
                )}
              </AnimatePresence>
            </g>
          );
        })}
      </svg>

      {/* Devices */}
      {devices.map((device, i) => (
        <motion.div
          key={device.name}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className="absolute"
          style={{
            left: `calc(50% + ${isMobile ? device.position.mobileX : device.position.x}px)`,
            top: `calc(50% + ${isMobile ? device.position.mobileY : device.position.y}px)`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="flex flex-col items-center">
            <motion.div
              animate={syncActive ? { scale: [1, 1.1, 1] } : {}}
              transition={{ delay: i * 0.2 }}
              className="text-2xl sm:text-3xl md:text-4xl mb-1"
            >
              {device.icon}
            </motion.div>
            <span className="text-[10px] sm:text-xs text-gray-600 font-medium">{device.name}</span>
            {syncActive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="absolute -top-6 sm:-top-8 bg-green-500 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full"
              >
                Synced!
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}

      {/* File type indicators on the lines */}
      <AnimatePresence>
        {syncActive && devices.map((device, i) => (
          <motion.div
            key={`file-type-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="absolute"
            style={{
              left: `calc(50% + ${(isMobile ? device.position.mobileX : device.position.x) / 2}px)`,
              top: `calc(50% + ${(isMobile ? device.position.mobileY : device.position.y) / 2 - 20}px)`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="bg-white rounded-full p-1 sm:p-1.5 shadow-md border-2 border-[#FA8072]/20">
              <span className="text-base sm:text-lg md:text-xl">{fileTypes[i].icon}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Labels for file types being synced */}
      <AnimatePresence>
        {syncActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2"
          >
            {fileTypes.map((type, i) => (
              <motion.div
                key={type.label}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white px-1 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-sm text-[10px] sm:text-xs font-medium flex items-center gap-1"
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DeadlineTrackerDemo = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="relative w-full h-48 sm:h-56 md:h-64 mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-white rounded-lg shadow-lg p-3 sm:p-4 ${isMobile ? 'max-w-full' : 'max-w-sm'} mx-auto`}
      >
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <Calendar className="h-5 sm:h-6 w-5 sm:w-6 text-[#FA8072]" />
          <span className="font-semibold text-sm sm:text-base">March 2024</span>
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
              className="flex items-center justify-between p-1.5 sm:p-2 bg-gray-50 rounded"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={item.done ? {} : { scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {item.done ? (
                    <CheckCircle className="h-3 sm:h-4 w-3 sm:w-4 text-green-500" />
                  ) : (
                    <Clock className="h-3 sm:h-4 w-3 sm:w-4 text-[#FA8072]" />
                  )}
                </motion.div>
                <span className="text-xs sm:text-sm">{item.task}</span>
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500">{item.date}</span>
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
  const isMobile = useIsMobile();

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
    <div className={`relative w-full ${isMobile ? 'h-80' : 'h-64'} mx-auto`}>
      <div className={`${isMobile ? 'space-y-4' : 'flex gap-8'} items-start justify-center h-full`}>
        {/* Your Courses */}
        <div className={`space-y-2 ${isMobile ? 'w-full' : ''}`}>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 sm:mb-3">Your Courses</h3>
          {courses.map((course, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedCourse(i)}
              className={`cursor-pointer p-2 sm:p-3 rounded-lg transition-all ${
                selectedCourse === i 
                  ? 'bg-[#FA8072] text-white shadow-lg scale-105' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl md:text-2xl">{course.emoji}</span>
                <span className="text-xs sm:text-sm font-medium">{course.name}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Brain */}
        {!isMobile && (
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
              <Brain className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 text-[#FA8072]" />
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
        )}

        {/* Recommended Resources */}
        <div className={`space-y-2 ${isMobile ? 'w-full' : ''}`}>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 sm:mb-3">Recommended Resources</h3>
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
                    className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-gradient-to-r from-[#FFE4E1] to-white rounded-lg shadow-sm"
                  >
                    <span className="text-base sm:text-lg md:text-xl">{resourceIcons[resource as keyof typeof resourceIcons]}</span>
                    <div className="flex-1">
                      <div className="text-xs sm:text-sm font-medium text-gray-700">{resource}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500">Free resource</div>
                    </div>
                    <Link className="h-3 sm:h-4 w-3 sm:w-4 text-[#FA8072]" />
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
  const isMobile = useIsMobile();

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
    <div className={`relative w-full ${isMobile ? 'h-80' : 'h-64'} mx-auto`}>
      <div className={`${isMobile ? 'space-y-4' : 'flex gap-8'} items-center justify-center h-full`}>
        {/* Study Group */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 ${isMobile ? 'w-full' : 'w-64'}`}
          >
            <div className="flex items-center gap-2 mb-2 sm:mb-4">
              <Users className="h-4 sm:h-5 w-4 sm:w-5 text-[#FA8072]" />
              <span className="font-semibold text-xs sm:text-sm">Study Group: CS 101</span>
            </div>
            
            {/* User avatars */}
            <div className="flex -space-x-2 mb-2 sm:mb-4">
              {users.map((user, i) => (
                <motion.div
                  key={user.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <div 
                    className="w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg border-2 border-white"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.avatar}
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                    className="absolute -bottom-1 -right-1 w-2 sm:w-3 h-2 sm:h-3 bg-green-500 rounded-full border-2 border-white"
                  />
                </motion.div>
              ))}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.1 }}
                className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white hover:bg-gray-300 transition-colors"
              >
                <UserPlus className="h-3 sm:h-4 w-3 sm:w-4 text-gray-600" />
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
                      className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1"
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
        {!isMobile && (
          <AnimatePresence>
            {showFiles && (
              <motion.div
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: 'spring' }}
                className="relative"
              >
                <Share2 className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 text-[#FA8072]" />
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
                    <FileText className="h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6 text-[#FA8072]" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Shared folder */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`bg-gradient-to-br from-[#FFE4E1] to-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 ${isMobile ? 'w-full' : ''}`}
        >
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <FolderOpen className="h-4 sm:h-5 w-4 sm:w-5 text-[#FA8072]" />
            <span className="font-semibold text-xs sm:text-sm">Shared Materials</span>
          </div>
          
          <div className="space-y-2">
            {['Lecture Notes', 'Practice Problems', 'Study Guides', 'Past Exams'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-700"
              >
                <motion.div
                  animate={showFiles ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ delay: i * 0.2 }}
                >
                  <FileText className="h-3 sm:h-4 w-3 sm:w-4 text-[#FA8072]" />
                </motion.div>
                <span>{item}</span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="ml-auto text-[8px] sm:text-[10px] text-gray-500"
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
  const isMobile = useIsMobile();

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
    <div className={`relative w-full ${isMobile ? 'h-80' : 'h-64'} mx-auto ${isMobile ? 'space-y-4' : 'flex gap-6'} items-center justify-center`}>
      {/* Before CourseFlow */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className={`bg-gray-100 rounded-lg shadow-lg p-3 sm:p-4 ${isMobile ? 'w-full' : 'w-48'}`}
      >
        <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 sm:mb-3">Before CourseFlow</h3>
        <div className="space-y-2">
          {grades.map((grade, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-[10px] sm:text-xs text-gray-600">{grade.subject}:</span>
              <span className="text-base sm:text-lg font-bold text-red-500">{grade.before}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 sm:mt-3 text-center">
          <span className="text-[10px] sm:text-xs text-gray-500">GPA: 2.3</span>
        </div>
      </motion.div>

      {/* Arrow */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[#FA8072]"
        >
          <ChevronRight className="h-6 sm:h-8 w-6 sm:w-8" />
        </motion.div>
      )}

      {/* After CourseFlow */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className={`bg-gradient-to-br from-[#FFE4E1] to-white rounded-lg shadow-lg p-3 sm:p-4 ${isMobile ? 'w-full' : 'w-48'}`}
      >
        <h3 className="text-xs sm:text-sm font-semibold text-[#FA8072] mb-2 sm:mb-3">With CourseFlow</h3>
        <div className="space-y-2">
          {grades.map((grade, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-[10px] sm:text-xs text-gray-600">{grade.subject}:</span>
              <div className="flex items-center gap-1">
                {showImprovement && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-base sm:text-lg font-bold text-green-600"
                  >
                    {grade.after}
                  </motion.span>
                )}
                {!showImprovement && (
                  <span className="text-base sm:text-lg font-bold text-gray-400">?</span>
                )}
                {showImprovement && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <TrendingUp className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-green-500" />
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
          className="mt-2 sm:mt-3 text-center"
        >
          <span className="text-[10px] sm:text-xs font-semibold text-[#FA8072]">GPA: 3.6 ✨</span>
        </motion.div>
      </motion.div>

      {/* Improvement indicators */}
      {showImprovement && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
          className={`${isMobile ? 'relative' : 'absolute top-0 right-0'} bg-green-500 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full`}
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
          
          <div className="relative h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl w-full px-4"
            >
              {/* Title and description */}
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4"
                >
                  {currentBenefit.title}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4"
                >
                  {currentBenefit.description}
                </motion.p>
              </div>

              {/* Animated demonstration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6 sm:mb-8 md:mb-12"
              >
                <Demo />
              </motion.div>

              {/* Progress dots */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-1 sm:gap-2 mb-4 sm:mb-6 md:mb-8"
              >
                {benefits.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-6 sm:w-8 bg-[#FA8072]'
                        : index < currentIndex
                        ? 'w-1.5 sm:w-2 bg-[#FFB6B0]'
                        : 'w-1.5 sm:w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </motion.div>

              {/* Navigation button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center"
              >
                <Button
                  onClick={handleNext}
                  className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all bg-[#FA8072] hover:bg-[#FF6B6B] text-white border-0"
                >
                  {currentIndex === benefits.length - 1 ? (
                    <>
                      Get Started
                      <Sparkles className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.7 }}
              className="absolute bottom-4 sm:bottom-8 text-xs sm:text-sm text-gray-500"
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
            className="absolute top-10 sm:top-20 left-10 sm:left-20 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-[#FFB6B0] rounded-full blur-3xl opacity-20"
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
            className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-[#FFDAB9] rounded-full blur-3xl opacity-20"
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