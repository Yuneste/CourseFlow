'use client';

import { useState, useEffect } from 'react';
import { Course, User, StatsCardProps, FeatureCardProps } from '@/types';
import { getAcademicSystemWithTerms } from '@/lib/academic-systems';
import { useAppStore } from '@/stores/useAppStore';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TermFilter } from '@/components/ui/term-filter';
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
  Settings,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CustomerPortalButton } from '@/components/billing/customer-portal-button';
import { UpgradePrompt } from '@/components/pricing/upgrade-prompt';
import { UsageIndicator } from '@/components/UsageIndicator';
import { lightTheme, lightThemeClasses, componentStyles } from '@/lib/theme/light-theme';

interface DashboardClientProps {
  initialCourses: Course[];
  userProfile: User;
}

// Light theme stats card - 10% smaller
const StatsCard = ({ title, value, icon: Icon, delay = 0, trend, color }: StatsCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: "easeOut" }}
    whileHover={{ scale: 1.02, y: -2 }}
    className="relative group"
  >
    <div className={cn(componentStyles.statsCard.base, "p-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-lg relative overflow-hidden")}>
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/5 to-[#8B5CF6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative flex items-center gap-3">
        <div className={cn(
          componentStyles.statsCard.icon,
          "p-2.5 rounded-lg transition-all duration-300 group-hover:scale-110"
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className={componentStyles.statsCard.title}>{title}</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className={cn(
              componentStyles.statsCard.value,
              "text-xl",
              title === "Current Term" && "text-[#64748B]"
            )}>{value}</h3>
            {trend && (
              <span className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded-full",
                trend > 0 ? "bg-[#E0E7FF] text-[#6366F1] border border-[#C7D2FE]" : "bg-gray-50 text-gray-600 border border-gray-200"
              )}>
                {trend > 0 ? `+${trend}` : trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// Light theme feature card - 10% smaller
const FeatureCard = ({ title, description, icon: Icon, href, color, delay, available = true, badge }: FeatureCardProps) => {
  const router = useRouter();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={available ? { scale: 1.02, y: -3 } : {}}
      whileTap={available ? { scale: 0.98 } : {}}
      className="relative group h-full"
    >
      <div 
        className={cn(
          componentStyles.featureCard.base,
          "relative overflow-hidden cursor-pointer h-full p-5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-lg",
          available 
            ? "hover:border-[#6366F1]/30" 
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/5 to-[#8B5CF6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        <div className="relative">
          {/* Header with icon and badge */}
          <div className="flex items-start justify-between mb-3">
            <div className={cn(
              "p-2.5 rounded-lg bg-[#E0E7FF] transition-all duration-300 group-hover:scale-110",
              "group-hover:bg-[#C7D2FE]"
            )}>
              <Icon className={componentStyles.featureCard.icon + " h-5 w-5"} />
            </div>
            {badge && (
              <span className="px-2 py-0.5 bg-[#E0E7FF] text-[#4F46E5] text-xs font-medium rounded-full border border-[#C7D2FE]">
                {badge}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <h3 className={cn(componentStyles.featureCard.title, "text-base")}>
              {title}
            </h3>
            <p className={cn(componentStyles.featureCard.description, "text-xs leading-relaxed")}>
              {description}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            <span className={cn(
              "text-xs font-medium transition-colors duration-300",
              available ? "text-[#6366F1]" : "text-gray-400"
            )}>
              {available ? 'Open' : 'Coming Soon'}
            </span>
            <ChevronRight className={cn(
              "h-3.5 w-3.5 transition-all duration-300",
              available ? "text-[#6366F1] group-hover:translate-x-1" : "text-gray-400"
            )} />
          </div>
        </div>

        {/* Coming soon overlay */}
        {!available && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm rounded-lg">
            <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200">
              Coming Soon
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Modern welcome header
const WelcomeHeader = ({ userName }: { userName: string }) => {
  // Initialize with a default greeting to avoid hydration mismatch
  const [greeting, setGreeting] = useState("Welcome");
  const [mounted, setMounted] = useState(false);
  
  const firstName = userName.split(' ')[0] || 'Student';
  
  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Welcome message */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {greeting}, <span className="text-[#6366F1]">{firstName}</span>
          </h1>
          <p className="text-gray-600 text-sm">
            Ready to make progress on your academic journey?
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-3">
          <Button 
            size="sm" 
            className={cn(lightThemeClasses.button.secondary, "gap-2")}
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Notifications</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// Quick search bar (temporarily disabled)
const QuickSearch = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="mb-6"
  >
    <div className="relative max-w-md mx-auto">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
      <input
        type="text"
        placeholder="Search functionality coming soon..."
        className="w-full pl-9 pr-3 py-2 text-sm bg-card/50 border border-border rounded-lg cursor-not-allowed opacity-60 transition-colors"
        disabled
      />
    </div>
  </motion.div>
);

export function DashboardClient({ initialCourses, userProfile }: DashboardClientProps) {
  const router = useRouter();
  const { courses, setCourses, setUser } = useAppStore();
  const [selectedTerm, setSelectedTerm] = useState('');

  useEffect(() => {
    setUser(userProfile);
  }, [userProfile, setUser]);

  useEffect(() => {
    // Always sync with the latest courses from the server
    setCourses(initialCourses);
  }, [initialCourses, setCourses]);

  const country = userProfile?.country || 'US';
  const systemInfo = getAcademicSystemWithTerms(country);
  
  // Filter courses by selected term
  const filteredCourses = selectedTerm 
    ? courses.filter(course => course.term === selectedTerm)
    : courses;
    
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
    <div className={lightThemeClasses.page.wrapper}>
      <div className={lightThemeClasses.page.container + " py-8"}>
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <WelcomeHeader userName={userProfile.full_name || 'Student'} />

        {/* Quick search */}
        <QuickSearch />

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-base font-semibold text-[#8B5CF6] mb-3">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatsCard
              title="Active Courses"
              value={activeCourses}
              icon={BookOpen}
              color="bg-primary/10"
              delay={0.4}
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
              value={userProfile.current_term || systemInfo.currentTerm}
              icon={Calendar}
              color="bg-success/10"
              delay={0.6}
            />
          </div>
        </motion.div>

        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-6"
        >
          <div className={cn(lightThemeClasses.card.base, "p-4 rounded-lg")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2.5 rounded-lg transition-colors",
                  userProfile.subscription_tier === 'master' ? "bg-amber-50 border border-amber-200" : 
                  userProfile.subscription_tier === 'scholar' ? "bg-[#E0E7FF] border border-[#C7D2FE]" :
                  "bg-gray-50 border border-gray-200"
                )}>
                  <Crown className={cn(
                    "h-4 w-4",
                    userProfile.subscription_tier === 'master' ? "text-amber-600" : 
                    userProfile.subscription_tier === 'scholar' ? "text-[#6366F1]" :
                    "text-gray-400"
                  )} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {userProfile.subscription_tier === 'explorer' ? 'Free Plan' :
                     userProfile.subscription_tier === 'scholar' ? 'Scholar Plan' :
                     'Master Plan'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userProfile.subscription_tier === 'explorer' 
                      ? 'Upgrade to unlock more features'
                      : userProfile.subscription_status === 'active' 
                        ? 'Active subscription' 
                        : 'Subscription ' + userProfile.subscription_status}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {userProfile.subscription_tier === 'explorer' ? (
                  <Button size="sm" className={lightThemeClasses.button.primary} asChild>
                    <Link href="/pricing">
                      <Sparkles className="h-3 w-3 mr-1.5" />
                      Upgrade
                    </Link>
                  </Button>
                ) : userProfile.stripe_customer_id ? (
                  <CustomerPortalButton />
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>

        {/* My Courses Section */}
        {activeCourses > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-[#8B5CF6]">My Courses</h2>
              <div className="flex items-center gap-2">
                <TermFilter
                  countryCode={country}
                  onTermChange={setSelectedTerm}
                  variant="compact"
                />
                <Button size="sm" variant="ghost" className={cn(lightThemeClasses.button.ghost, "gap-2")} asChild>
                  <Link href="/courses">
                    <span className="text-xs">View All</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCourses.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 text-sm">No courses found for the selected term.</p>
                </div>
              ) : filteredCourses.slice(0, 3).map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  className="group cursor-pointer"
                  onClick={() => router.push(`/courses/${course.id}`)}
                >
                  <div className={cn(
                    lightThemeClasses.card.base,
                    "p-4 hover:border-[#6366F1]/30 transition-all duration-300 relative overflow-hidden"
                  )}>
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/5 to-[#8B5CF6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-semibold text-[#3B82F6]">{course.name}</h3>
                        <div className="p-1.5 bg-[#E0E7FF] rounded-lg group-hover:bg-[#C7D2FE] transition-colors">
                          <Target className="h-3.5 w-3.5 text-[#6366F1]" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {course.code} • {course.professor && `Prof. ${course.professor}`}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {userProfile.academic_system === 'ects' 
                            ? `${course.ects_credits || 0} ECTS` 
                            : `${course.credits || 0} credits`}
                        </span>
                        <span className="text-xs font-medium text-[#6366F1] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Open
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#8B5CF6]">Quick Actions</h2>
            <Button variant="ghost" size="sm" className={cn(lightThemeClasses.button.ghost, "gap-2")}>
              <Settings className="h-3.5 w-3.5" />
              <span className="text-xs">Customize</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={1.1 + index * 0.1}
              />
            ))}
          </div>
        </motion.div>

        {/* Delete old My Courses Section */}
        {false && (
          <div></div>
        )}

        {/* Usage Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-8"
        >
          <UsageIndicator />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mt-8"
        >
          <h2 className="text-base font-semibold text-[#8B5CF6] mb-3">Recent Activity</h2>
          <div className={cn(lightThemeClasses.card.base, "p-5 text-center")}>
            <div className="p-3 bg-[#F3F4F6] rounded-lg inline-block mb-2">
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm">
              Activity tracking coming soon
            </p>
            <p className="text-gray-500 text-xs mt-1">
              You&apos;ll see your recent uploads, study sessions, and more here.
            </p>
          </div>
        </motion.div>

        {/* Upgrade Prompt for Free Users */}
        {userProfile.subscription_tier === 'explorer' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="mt-8"
          >
            <UpgradePrompt />
          </motion.div>
        )}

        {/* Get Started Message */}
        {activeCourses === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-8"
          >
            <div className={cn(lightThemeClasses.card.colored, "p-8 text-center rounded-xl")}>
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-[#E6F7F5] rounded-full">
                  <Sparkles className="h-8 w-8 text-[#8CC2BE]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Welcome to CourseFlow!
                  </h3>
                  <p className="text-gray-600 text-base max-w-md">
                    Start your academic journey by adding your first course. 
                    Upload materials, organize files, and track your progress.
                  </p>
                </div>
                <Button className={cn(lightThemeClasses.button.primary, "mt-4")} asChild>
                  <Link href="/courses/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Course
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
}