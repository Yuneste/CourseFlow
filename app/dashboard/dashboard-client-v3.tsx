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
const StatsCard = ({ title, value, icon: Icon, delay, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="relative"
  >
    <Card className="p-4 border-0 !bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-[#1a1a1a]" />
        </div>
        <div>
          <p className="text-xs text-[#1a1a1a]/60 font-medium">{title}</p>
          <h3 className="text-sm font-bold text-[#1a1a1a] break-words">
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
          "transition-all duration-300 border-[#C7C7AD]/20",
          available 
            ? "hover:shadow-2xl hover:border-[#C7C7AD] bg-white/80 backdrop-blur-sm shadow-xl" 
            : "opacity-60 cursor-not-allowed bg-white/60 backdrop-blur-sm shadow-lg"
        )}
        onClick={() => {
          if (available) {
            if (href.startsWith('http')) {
              window.open(href, '_blank')
            } else {
              router.push(href)
            }
          }
        }}
      >
        <div className="p-6">
          <div className={cn(
            "w-14 h-14 rounded-lg flex items-center justify-center mb-4",
            color
          )}>
            <Icon className="h-7 w-7 text-[#1a1a1a]" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-[#1a1a1a]">{title}</h3>
          <p className="text-[#1a1a1a]/70 mb-4">{description}</p>
          <div className="flex items-center text-[#1a1a1a] font-medium">
            <span>{available ? 'Access Now' : 'Coming Soon'}</span>
            <ChevronRight className="h-5 w-5 ml-1" />
          </div>
        </div>
        {!available && (
          <div className="absolute inset-0 bg-[#1a1a1a]/5 flex items-center justify-center">
            <span className="bg-[#1a1a1a] text-white px-3 py-1 rounded-full text-sm font-medium">
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
  
  // Extract first name
  const firstName = userName.split(' ')[0];
  
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
      <h1 className="text-4xl md:text-5xl font-bold mb-3 text-[#1a1a1a]">
        Welcome back, 
        <span 
          className="text-[#FA8072] relative"
          style={{
            textShadow: '2px 2px 0px #1a1a1a, -2px -2px 0px #1a1a1a, 2px -2px 0px #1a1a1a, -2px 2px 0px #1a1a1a',
            WebkitTextStroke: '1px #1a1a1a'
          }}
        >
          {firstName}!
        </span>
      </h1>
      <p className="text-lg text-[#1a1a1a]/70 font-medium">{greeting}</p>
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
      color: 'bg-[#F0C4C0]',
      available: true
    },
    {
      title: 'Study Planner',
      description: 'Plan study sessions and manage your time effectively',
      icon: Calendar,
      href: '/planner',
      color: 'bg-[#ECF0C0]',
      available: false
    },
    {
      title: 'AI Assistant',
      description: 'Get personalized help with your coursework',
      icon: Brain,
      href: '/ai-assistant',
      color: 'bg-[#C0ECF0]',
      available: false
    },
    {
      title: 'Analytics',
      description: 'Track your academic performance and progress',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-[#C4C0F0]',
      available: false
    },
    {
      title: 'Study Groups',
      description: 'Collaborate with classmates and share resources',
      icon: Users,
      href: '/groups',
      color: 'bg-[#F0C4C0]',
      available: false
    },
    {
      title: 'Time Tracker',
      description: 'Monitor time spent on each course',
      icon: Clock,
      href: '/time-tracker',
      color: 'bg-[#ECF0C0]',
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
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto"
      >
        <StatsCard
          title="Active"
          value={activeCourses}
          icon={BookOpen}
          color="bg-[#F0C4C0]"
          delay={0.2}
        />
        <StatsCard
          title="Completed"
          value={completedCourses}
          icon={Target}
          color="bg-[#ECF0C0]"
          delay={0.3}
        />
        <StatsCard
          title="Term"
          value={systemInfo.currentTerm}
          icon={Calendar}
          color="bg-[#C0ECF0]"
          delay={0.4}
        />
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-[#1a1a1a]">
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

      {/* Pro Tip - Only show when no courses */}
      {activeCourses === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <Card className="inline-block px-6 py-3 bg-[#F0C4C0]/20 backdrop-blur-sm border-[#F0C4C0]/30 shadow-lg">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-[#FA8072]" />
              <span className="text-sm text-[#1a1a1a] font-medium">
                Pro tip: Start by adding your courses to unlock all features
              </span>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}