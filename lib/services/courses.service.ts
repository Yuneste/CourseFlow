import { api } from '@/lib/api/client';
import type { Course } from '@/types';

export interface CreateCourseInput {
  name: string;
  term: string;
  code?: string;
  professor?: string;
  academic_period_type?: 'semester' | 'term' | 'trimester';
  credits?: number;
  ects_credits?: number;
  color?: string;
  emoji?: string;
}

export interface UpdateCourseInput {
  name?: string;
  term?: string;
  code?: string | null;
  professor?: string | null;
  academic_period_type?: 'semester' | 'term' | 'trimester' | null;
  credits?: number | null;
  ects_credits?: number | null;
  color?: string;
  emoji?: string | null;
}

class CoursesService {
  /**
   * Get all courses for the authenticated user
   * @param term Optional term filter
   */
  async getCourses(term?: string): Promise<Course[]> {
    const params = term ? { term } : undefined;
    return api.get<Course[]>('/courses', params);
  }

  /**
   * Get a specific course by ID
   */
  async getCourse(id: string): Promise<Course> {
    return api.get<Course>(`/courses/${id}`);
  }

  /**
   * Create a new course
   */
  async createCourse(course: CreateCourseInput): Promise<Course> {
    // Validate required fields
    if (!course.name || !course.term) {
      throw new Error('Course name and term are required');
    }

    // Validate field lengths
    if (course.name.length < 2 || course.name.length > 100) {
      throw new Error('Course name must be between 2 and 100 characters');
    }

    if (course.code && course.code.length > 20) {
      throw new Error('Course code must be 20 characters or less');
    }

    if (course.professor && course.professor.length > 100) {
      throw new Error('Professor name must be 100 characters or less');
    }

    return api.post<Course>('/courses', course);
  }

  /**
   * Update an existing course
   */
  async updateCourse(id: string, updates: UpdateCourseInput): Promise<Course> {
    // Validate field lengths if provided
    if (updates.name !== undefined) {
      if (!updates.name || updates.name.length < 2 || updates.name.length > 100) {
        throw new Error('Course name must be between 2 and 100 characters');
      }
    }

    if (updates.code !== undefined && updates.code && updates.code.length > 20) {
      throw new Error('Course code must be 20 characters or less');
    }

    if (updates.professor !== undefined && updates.professor && updates.professor.length > 100) {
      throw new Error('Professor name must be 100 characters or less');
    }

    return api.put<Course>(`/courses/${id}`, updates);
  }

  /**
   * Delete a course
   */
  async deleteCourse(id: string): Promise<void> {
    await api.delete(`/courses/${id}`);
  }

  /**
   * Check if a course name already exists for a given term
   */
  async isDuplicateCourse(name: string, term: string, excludeId?: string): Promise<boolean> {
    try {
      const courses = await this.getCourses(term);
      return courses.some(course => 
        course.name.toLowerCase() === name.toLowerCase() && 
        course.id !== excludeId
      );
    } catch (error) {
      console.error('Error checking for duplicate course:', error);
      return false;
    }
  }

  /**
   * Get courses grouped by term
   */
  async getCoursesByTerm(): Promise<Record<string, Course[]>> {
    const courses = await this.getCourses();
    
    return courses.reduce((grouped, course) => {
      if (!grouped[course.term]) {
        grouped[course.term] = [];
      }
      grouped[course.term].push(course);
      return grouped;
    }, {} as Record<string, Course[]>);
  }

  /**
   * Get course statistics
   */
  async getCourseStats(): Promise<{
    totalCourses: number;
    coursesByTerm: Record<string, number>;
    creditsByTerm: Record<string, number>;
  }> {
    const courses = await this.getCourses();
    
    const stats = {
      totalCourses: courses.length,
      coursesByTerm: {} as Record<string, number>,
      creditsByTerm: {} as Record<string, number>,
    };

    courses.forEach(course => {
      // Count courses by term
      if (!stats.coursesByTerm[course.term]) {
        stats.coursesByTerm[course.term] = 0;
        stats.creditsByTerm[course.term] = 0;
      }
      stats.coursesByTerm[course.term]++;
      
      // Sum credits by term
      if (course.credits) {
        stats.creditsByTerm[course.term] += course.credits;
      } else if (course.ects_credits) {
        // Convert ECTS to US credits (rough approximation: 2 ECTS = 1 US credit)
        stats.creditsByTerm[course.term] += Math.round(course.ects_credits / 2);
      }
    });

    return stats;
  }
}

export const coursesService = new CoursesService();