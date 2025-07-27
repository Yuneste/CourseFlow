'use client';

import { useState, useEffect } from 'react';
import { Course, User } from '@/types';
import { CourseList } from '@/components/features/courses/CourseList';
import { coursesService } from '@/lib/services/courses.service';
import { useAppStore } from '@/stores/useAppStore';
import { useRouter } from 'next/navigation';
import { getAcademicSystemWithTerms } from '@/lib/academic-systems';

interface DashboardClientProps {
  initialCourses: Course[];
  userProfile: any;
}

export function DashboardClient({ initialCourses, userProfile }: DashboardClientProps) {
  const router = useRouter();
  
  // Get state and actions from Zustand store
  const {
    courses,
    isLoadingCourses,
    coursesError,
    setCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    setLoadingCourses,
    setCoursesError,
  } = useAppStore();

  // Initialize courses in store on mount
  useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses, setCourses]);

  // Determine academic system based on user's country
  const academicSystem = getAcademicSystemWithTerms(userProfile?.country || 'US');

  const handleCreateCourse = async (courseData: any) => {
    try {
      setLoadingCourses(true);
      setCoursesError(null);
      const newCourse = await coursesService.createCourse({
        ...courseData,
        academic_period_type: academicSystem.periodType,
      });
      addCourse(newCourse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create course';
      setCoursesError(errorMessage);
      throw err; // Re-throw to let the form handle it
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleUpdateCourse = async (id: string, updates: any) => {
    try {
      setLoadingCourses(true);
      setCoursesError(null);
      const updatedCourse = await coursesService.updateCourse(id, updates);
      updateCourse(id, updatedCourse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update course';
      setCoursesError(errorMessage);
      throw err;
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      setLoadingCourses(true);
      setCoursesError(null);
      await coursesService.deleteCourse(id);
      deleteCourse(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete course';
      setCoursesError(errorMessage);
      throw err;
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleCourseClick = (course: Course) => {
    // For future use - could navigate to course details page
    // For now, the CourseList component handles edit/delete internally
    console.log('Course clicked:', course);
  };

  return (
    <div>
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
        viewMode="grid"
      />
    </div>
  );
}