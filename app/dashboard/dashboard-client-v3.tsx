'use client';

import { useState, useEffect } from 'react';
import { Course, User } from '@/types';
import { getAcademicSystemWithTerms } from '@/lib/academic-systems';
import dynamic from 'next/dynamic';

// Lazy load CourseList to reduce initial bundle size
const CourseList = dynamic(
  () => import('@/components/features/courses/CourseList').then(mod => ({ default: mod.CourseList })),
  { 
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }
);
import { coursesService } from '@/lib/services/courses.service';
import { useAppStore } from '@/stores/useAppStore';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  Plus, 
  TrendingUp, 
  BookOpen, 
  Calendar,
  Target,
  Sparkles,
  ChevronRight,
  BarChart3
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

// Animated welcome message
const WelcomeMessage = ({ userName }: { userName: string }) => {
  const [greeting, setGreeting] = useState("Ready to ace your courses?");
  
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
      className="mb-12 text-center"
    >
      <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">
        Welcome back,
        <br />
        <span className="gradient-text">{userName}!</span>
      </h1>
      <p className="text-xl text-gray-600">{greeting}</p>
    </motion.div>
  );
};

export function DashboardClient({ initialCourses, userProfile }: DashboardClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const {
    courses,
    setCourses,
    setUser,
    addCourse,
    updateCourse,
    deleteCourse,
    isLoadingCourses,
    setLoadingCourses,
    coursesError,
    setCoursesError,
  } = useAppStore();

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

  const handleCourseClick = (course: Course) => {
    router.push(`/courses/${course.id}`);
  };

  const handleCreateCourse = async (courseData: Partial<Course>) => {
    setIsLoading(true);
    setLoadingCourses(true);
    try {
      const newCourse = await coursesService.createCourse(courseData as any);
      addCourse(newCourse);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create course:', error);
      setCoursesError('Failed to create course');
    } finally {
      setIsLoading(false);
      setLoadingCourses(false);
    }
  };

  const handleUpdateCourse = async (id: string, updates: Partial<Course>) => {
    setIsLoading(true);
    try {
      const updatedCourse = await coursesService.updateCourse(id, updates);
      updateCourse(id, updatedCourse);
    } catch (error) {
      console.error('Failed to update course:', error);
      setCoursesError('Failed to update course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    setIsLoading(true);
    try {
      await coursesService.deleteCourse(id);
      deleteCourse(id);
    } catch (error) {
      console.error('Failed to delete course:', error);
      setCoursesError('Failed to delete course');
    } finally {
      setIsLoading(false);
    }
  };

  const country = userProfile?.country || 'US';
  const systemInfo = getAcademicSystemWithTerms(country);
  
  const academicSystem = {
    terms: systemInfo.terms,
    periodType: systemInfo.periodType,
    creditSystem: systemInfo.creditSystem
  };

  // Calculate stats
  const activeCourses = courses.length;
  const completedCourses = 0; // TODO: Add completion tracking later

  return (
    <>
      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Card className="p-4 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <WelcomeMessage userName={userProfile.full_name || 'Student'} />

        {/* Stats Grid - Compact */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <StatsCard
              title="Active Courses"
              value={activeCourses}
              icon={BookOpen}
              delay={0.1}
            />
            <StatsCard
              title="Completed"
              value={completedCourses}
              icon={Target}
              delay={0.2}
            />
            <StatsCard
              title="Current Term"
              value={systemInfo.currentTerm}
              icon={Calendar}
              delay={0.3}
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center"
          >
            <Link href="/dashboard/stats">
              <Button variant="outline" size="sm" className="text-[#FA8072] border-[#FA8072] hover:bg-[#FFF5F5]">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Statistics
              </Button>
            </Link>
          </motion.div>
        </div>


        {/* Error display */}
        <AnimatePresence>
          {coursesError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600"
            >
              {coursesError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Courses Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
              My Courses
              <Sparkles className="h-6 w-6 text-[#FA8072]" />
            </h2>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-[#FA8072] to-[#FF6B6B] text-white hover:from-[#FF6B6B] hover:to-[#FA8072] rounded-md px-4 py-4"
                size="icon"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>

          <CourseList
            courses={courses}
            academicSystem={academicSystem}
            isLoading={isLoadingCourses}
            onCreateCourse={handleCreateCourse}
            onUpdateCourse={handleUpdateCourse}
            onDeleteCourse={handleDeleteCourse}
            onCourseClick={handleCourseClick}
            viewMode="grid"
            showCreateForm={showCreateForm}
            onCloseCreateForm={() => setShowCreateForm(false)}
          />
        </motion.div>

        {/* Empty state */}
        {courses.length === 0 && !isLoadingCourses && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No courses yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start by adding your first course to organize your academic life
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-[#FA8072] to-[#FF6B6B] text-white hover:from-[#FF6B6B] hover:to-[#FA8072]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Course
            </Button>
          </motion.div>
        )}
      </div>

      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
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
          className="absolute top-1/4 -left-32 w-64 h-64 bg-[#FFB6B0] rounded-full blur-3xl opacity-10"
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
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#FFDAB9] rounded-full blur-3xl opacity-10"
        />
      </div>
    </>
  );
}