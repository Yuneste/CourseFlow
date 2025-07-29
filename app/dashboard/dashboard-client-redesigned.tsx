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
  Sparkles,
  Plus,
  Search,
  Bell,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { UnifiedBackground, UnifiedSection } from '@/components/ui/unified-background';

interface DashboardClientProps {
  initialCourses: Course[];
  userProfile: User;
}

// Redesigned stats card with new design system
const StatsCard = ({ title, value, icon: Icon, delay, trend, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: "easeOut" }}
    whileHover={{ scale: 1.02, y: -2 }}
    className="relative group"
  >
    <Card className="p-6 bg-card border-border shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-xl transition-colors duration-300",
            color,
            "group-hover:scale-110 transition-transform"
          )}>
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-foreground">{value}</h3>
              {trend && (
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  trend > 0 ? "text-success bg-success/10" : "text-muted-foreground bg-muted"
                )}>
                  {trend > 0 ? `+${trend}` : trend}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

// Enhanced feature card with modern design
const FeatureCard = ({ title, description, icon: Icon, href, color, delay, available = true, badge }: {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  delay: number;
  available?: boolean;
  badge?: string;
}) => {
  const router = useRouter();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={available ? { scale: 1.02, y: -4 } : {}}
      whileTap={available ? { scale: 0.98 } : {}}
      className="relative group h-full"
    >
      <Card 
        className={cn(
          "relative overflow-hidden cursor-pointer h-full p-6 transition-all duration-300",
          "border-border bg-card shadow-sm",
          available 
            ? "hover:shadow-xl hover:border-primary/20" 
            : "opacity-60 cursor-not-allowed"
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
        {/* Gradient background on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative">
          {/* Header with icon and badge */}
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "p-3 rounded-xl transition-all duration-300",
              color,
              "group-hover:scale-110"
            )}>
              <Icon className="h-6 w-6 text-primary" />
            </div>
            {badge && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                {badge}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between">
            <span className={cn(
              "text-sm font-medium transition-colors duration-300",
              available ? "text-primary" : "text-muted-foreground"
            )}>
              {available ? 'Open' : 'Coming Soon'}
            </span>
            <ChevronRight className={cn(
              "h-4 w-4 transition-all duration-300",
              available ? "text-primary group-hover:translate-x-1" : "text-muted-foreground"
            )} />
          </div>
        </div>

        {/* Coming soon overlay */}
        {!available && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-medium">
              Coming Soon
            </span>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

// Modern welcome header
const WelcomeHeader = ({ userName }: { userName: string }) => {
  const [greeting, setGreeting] = useState("");
  
  const firstName = userName.split(' ')[0] || 'Student';
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Welcome message */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {greeting}, <span className="text-primary">{firstName}</span>
          </h1>
          <p className="text-muted-foreground">
            Ready to make progress on your academic journey?
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-3">
          <Button 
            size="sm" 
            variant="outline"
            className="gap-2"
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Notifications</span>
          </Button>
          <Button 
            size="sm"
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">New Course</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// Quick search bar
const QuickSearch = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="mb-8"
  >
    <div className="relative max-w-md mx-auto">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search courses, files, or features..."
        className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
      />
    </div>
  </motion.div>
);

export function DashboardClient({ initialCourses, userProfile }: DashboardClientProps) {
  const router = useRouter();
  const { courses, setCourses, setUser } = useAppStore();

  useEffect(() => {
    setUser(userProfile);
  }, [userProfile, setUser]);

  useEffect(() => {
    if (courses.length === 0 && initialCourses.length > 0) {
      setCourses(initialCourses);
    }
  }, [initialCourses, courses, setCourses]);

  const country = userProfile?.country || 'US';
  const systemInfo = getAcademicSystemWithTerms(country);
  
  // Enhanced stats
  const activeCourses = courses.length;
  const completedCourses = 0;
  const totalFiles = 0; // TODO: Calculate from courses
  
  const features = [
    {
      title: 'My Courses',
      description: `Manage your ${activeCourses} active courses and track academic progress`,
      icon: BookOpen,
      href: '/courses',
      color: 'bg-primary/10',
      available: true,
      badge: activeCourses > 0 ? `${activeCourses}` : undefined
    },
    {
      title: 'AI Study Assistant',
      description: 'Get personalized help with coursework and study recommendations',
      icon: Brain,
      href: '/ai-assistant',
      color: 'bg-success/10',
      available: false
    },
    {
      title: 'Analytics Dashboard',
      description: 'Track your academic performance with detailed insights and trends',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'bg-warning/10',
      available: true
    },
    {
      title: 'Study Groups',
      description: 'Collaborate with classmates and share resources effectively',
      icon: Users,
      href: '/groups',
      color: 'bg-primary/10',
      available: false
    },
    {
      title: 'Time Management',
      description: 'Plan study sessions and track time spent on each course',
      icon: Clock,
      href: '/time-tracker',
      color: 'bg-accent/50',
      available: false
    }
  ];

  return (
    <UnifiedBackground>
      <UnifiedSection>
        {/* Header */}
        <WelcomeHeader userName={userProfile.full_name || 'Student'} />

        {/* Quick search */}
        <QuickSearch />

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard
              title="Active Courses"
              value={activeCourses}
              icon={BookOpen}
              color="bg-primary/10"
              delay={0.4}
              trend={activeCourses > 0 ? activeCourses : null}
            />
            <StatsCard
              title="Files Uploaded"
              value={totalFiles}
              icon={FileText}
              color="bg-accent/50"
              delay={0.5}
            />
            <StatsCard
              title="Current Term"
              value={systemInfo.currentTerm}
              icon={Calendar}
              color="bg-success/10"
              delay={0.6}
            />
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Customize
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={0.5 + index * 0.1}
              />
            ))}
          </div>
        </motion.div>

        {/* Get Started Message */}
        {activeCourses === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-12"
          >
            <Card className="p-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Welcome to CourseFlow!
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Start your academic journey by adding your first course. 
                    Upload materials, organize files, and track your progress.
                  </p>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Course
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </UnifiedSection>
    </UnifiedBackground>
  );
}