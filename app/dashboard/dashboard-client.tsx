'use client';

import { useState, useEffect } from 'react';
import { Course, User } from '@/types';
import { CourseList } from '@/components/features/courses/CourseList';
import { CountrySelector } from '@/components/features/courses/CountrySelector';
import { coursesService } from '@/lib/services/courses.service';
import { useAppStore } from '@/stores/useAppStore';
import { useRouter } from 'next/navigation';

// Define academic systems by country
const ACADEMIC_SYSTEMS = {
  US: {
    name: 'United States',
    periodType: 'semester' as const,
    terms: ['Fall 2024', 'Spring 2025', 'Summer 2025'],
    creditSystem: 'credits',
  },
  CA: {
    name: 'Canada',
    periodType: 'semester' as const,
    terms: ['Fall 2024', 'Winter 2025', 'Summer 2025'],
    creditSystem: 'credits',
  },
  UK: {
    name: 'United Kingdom',
    periodType: 'term' as const,
    terms: ['Michaelmas 2024', 'Hilary 2025', 'Trinity 2025'],
    creditSystem: 'uk_honours',
  },
  DE: {
    name: 'Germany',
    periodType: 'semester' as const,
    terms: ['Wintersemester 2024/25', 'Sommersemester 2025'],
    creditSystem: 'ects',
  },
  NL: {
    name: 'Netherlands',
    periodType: 'trimester' as const,
    terms: ['Period 1', 'Period 2', 'Period 3', 'Period 4'],
    creditSystem: 'ects',
  },
};

interface DashboardClientProps {
  initialCourses: Course[];
  userProfile: any;
}

export function DashboardClient({ initialCourses, userProfile }: DashboardClientProps) {
  const router = useRouter();
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(userProfile?.country || null);
  
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

  // Check if country needs to be set
  useEffect(() => {
    if (!userProfile?.country) {
      setShowCountrySelector(true);
    }
  }, [userProfile?.country]);

  // Determine academic system based on user's country
  const getAcademicSystem = () => {
    const countryCode = selectedCountry || userProfile?.country || 'US';
    return ACADEMIC_SYSTEMS[countryCode as keyof typeof ACADEMIC_SYSTEMS] || ACADEMIC_SYSTEMS.US;
  };

  const academicSystem = getAcademicSystem();

  const handleCountrySelect = async (country: string) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country }),
      });

      if (response.ok) {
        setSelectedCountry(country);
        setShowCountrySelector(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update country:', error);
    }
  };

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

      <CountrySelector
        open={showCountrySelector}
        onSelect={handleCountrySelect}
      />
    </div>
  );
}