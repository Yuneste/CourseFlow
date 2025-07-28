'use client';

import { useState, useEffect } from 'react';
import { Course, User } from '@/types';
import { getAcademicSystemWithTerms } from '@/lib/academic-systems';
import { CourseList } from '@/components/features/courses/CourseList';
import { coursesService } from '@/lib/services/courses.service';
import { useAppStore } from '@/stores/useAppStore';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface DashboardClientProps {
  initialCourses: Course[];
  userProfile: User;
}

export function DashboardClient({ initialCourses, userProfile }: DashboardClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
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

  return (
    <>
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing...</span>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Courses</h1>
        </div>

        {coursesError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {coursesError}
          </div>
        )}
        
        <CourseList
          courses={courses}
          academicSystem={academicSystem}
          isLoading={isLoadingCourses}
          onCreateCourse={handleCreateCourse}
          onUpdateCourse={handleUpdateCourse}
          onDeleteCourse={handleDeleteCourse}
          onCourseClick={handleCourseClick}
          viewMode="grid"
        />
      </div>
    </>
  );
}