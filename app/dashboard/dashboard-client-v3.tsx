'use client';

import { useState, useEffect } from 'react';
import { Course, User } from '@/types';
import { getAcademicSystemWithTerms } from '@/lib/academic-systems';
import { useAppStore } from '@/stores/useAppStore';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Calendar,
  Target,
  FileText,
  Brain,
  BarChart3,
  Users,
  Clock,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface DashboardClientProps {
  initialCourses: Course[];
  userProfile: User;
}

// Compact stats card
const StatsCard = ({ title, value, icon: Icon, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="relative"
  >
    <Card className="p-4 border-0 !bg-white dark:!bg-white shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#FFE4E1] rounded-lg">
          <Icon className="h-5 w-5 text-[#FA8072]" />
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-600">{title}</p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-900">
            {value}
          </h3>
        </div>
      </div>
    </Card>
  </motion.div>
);

// Feature card component
const FeatureCard = ({ title, description, icon: Icon, href, color, delay, available = true }: {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  delay: number;
  available?: boolean;
}) => {
  const router = useRouter();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={available ? { scale: 1.05 } : {}}
      whileTap={available ? { scale: 0.95 } : {}}
    >
      <Card 
        className={cn(
          "relative overflow-hidden cursor-pointer h-full",
          "transition-all duration-300",
          available 
            ? "hover:shadow-xl hover:border-[#FA8072] bg-white" 
            : "opacity-60 cursor-not-allowed bg-gray-50"
        )}
        onClick={() => available && router.push(href)}
      >
        <div className="p-6">
          <div className={cn(
            "w-14 h-14 rounded-lg flex items-center justify-center mb-4",
            color
          )}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          <div className="flex items-center text-[#FA8072] font-medium">
            <span>{available ? 'Access Now' : 'Coming Soon'}</span>
            <ChevronRight className="h-5 w-5 ml-1" />
          </div>
        </div>
        {!available && (
          <div className="absolute inset-0 bg-gray-900/5 flex items-center justify-center">
            <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-medium">
              Coming Soon
            </span>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

// Animated welcome message
const WelcomeMessage = ({ userName }: { userName: string }) => {
  const [greeting, setGreeting] = useState("");
  
  useEffect(() => {
    const greetings = [
      "Ready to ace your courses?",
      "Let's make today productive!",
      "Your academic journey continues!",
      "Time to shine academically!"
    ];
    setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 text-center"
    >
      <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900">
        Welcome back, <span className="text-[#FA8072]">{userName}!</span>
      </h1>
      <p className="text-lg text-gray-600">{greeting}</p>
    </motion.div>
  );
};

export function DashboardClient({ initialCourses, userProfile }: DashboardClientProps) {
  const router = useRouter();
  const { courses, setCourses, setUser } = useAppStore();

  // Set user on mount
  useEffect(() => {
    setUser(userProfile);
  }, [userProfile, setUser]);

  // Initialize courses if empty
  useEffect(() => {
    if (courses.length === 0 && initialCourses.length > 0) {
      setCourses(initialCourses);
    }
  }, [initialCourses, courses, setCourses]);

  const country = userProfile?.country || 'US';
  const systemInfo = getAcademicSystemWithTerms(country);
  
  // Calculate stats
  const activeCourses = courses.length;
  const completedCourses = 0; // TODO: Add completion tracking later
  
  const features = [
    {
      title: 'My Courses',
      description: `Manage your ${activeCourses} active courses and track progress`,
      icon: BookOpen,
      href: '/courses',
      color: 'bg-[#FA8072]',
      available: true
    },
    {
      title: 'Study Planner',
      description: 'Plan study sessions and manage your time effectively',
      icon: Calendar,
      href: '/planner',
      color: 'bg-blue-500',
      available: false
    },
    {
      title: 'AI Assistant',
      description: 'Get personalized help with your coursework',
      icon: Brain,
      href: '/ai-assistant',
      color: 'bg-purple-500',
      available: false
    },
    {
      title: 'Analytics',
      description: 'Track your academic performance and progress',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-green-500',
      available: false
    },
    {
      title: 'Study Groups',
      description: 'Collaborate with classmates and share resources',
      icon: Users,
      href: '/groups',
      color: 'bg-indigo-500',
      available: false
    },
    {
      title: 'Time Tracker',
      description: 'Monitor time spent on each course',
      icon: Clock,
      href: '/time-tracker',
      color: 'bg-orange-500',
      available: false
    }
  ];

  return (
    <div id="main-content" className="container mx-auto px-4 py-8">
      <WelcomeMessage userName={userProfile.full_name || 'Student'} />

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto"
      >
        <Card className="p-4 bg-white border-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FFE4E1] rounded-lg">
              <BookOpen className="h-5 w-5 text-[#FA8072]" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Active</p>
              <p className="text-lg font-bold text-gray-900">{activeCourses}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Completed</p>
              <p className="text-lg font-bold text-gray-900">{completedCourses}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Term</p>
              <p className="text-lg font-bold text-gray-900">{systemInfo.currentTerm}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">GPA</p>
              <p className="text-lg font-bold text-gray-900">--</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          What would you like to do today?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              delay={0.4 + index * 0.1}
            />
          ))}
        </div>
      </motion.div>

      {/* Pro Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-12 text-center"
      >
        <Card className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFF5F5] border-[#FA8072] border">
          <Sparkles className="h-4 w-4 text-[#FA8072]" />
          <span className="text-sm text-gray-700">
            <span className="font-medium">Pro tip:</span> Start by adding your courses to unlock all features
          </span>
        </Card>
      </motion.div>
    </div>
  );
}