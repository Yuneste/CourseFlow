'use client';

import { useState, useEffect } from 'react';
import { Course, User } from '@/types';
import { CourseList } from '@/components/features/courses/CourseList';
import { coursesService } from '@/lib/services/courses.service';
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
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Determine academic system based on user's country
  const getAcademicSystem = () => {
    const countryCode = userProfile?.country || 'US';
    return ACADEMIC_SYSTEMS[countryCode as keyof typeof ACADEMIC_SYSTEMS] || ACADEMIC_SYSTEMS.US;
  };

  const academicSystem = getAcademicSystem();

  const handleCreateCourse = async (courseData: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const newCourse = await coursesService.createCourse({
        ...courseData,
        academic_period_type: academicSystem.periodType,
      });
      setCourses([newCourse, ...courses]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
      throw err; // Re-throw to let the form handle it
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCourse = async (id: string, updates: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedCourse = await coursesService.updateCourse(id, updates);
      setCourses(courses.map(course => 
        course.id === id ? updatedCourse : course
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await coursesService.deleteCourse(id);
      setCourses(courses.filter(course => course.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseClick = (course: Course) => {
    // For now, just log - in future stories this will navigate to course details
    console.log('Course clicked:', course);
  };

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}
      
      <CourseList
        courses={courses}
        academicSystem={academicSystem}
        isLoading={isLoading}
        onCreateCourse={handleCreateCourse}
        onUpdateCourse={handleUpdateCourse}
        onDeleteCourse={handleDeleteCourse}
        onCourseClick={handleCourseClick}
        viewMode="grid"
      />
    </div>
  );
}