import { api } from '@/lib/api/client';
import { Course, CourseFormData, CourseFolder } from '@/types';
import { logger } from '@/lib/services/logger.service';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, DB_LIMITS } from '@/lib/constants';

/**
 * Service for managing courses
 * Handles all course-related API operations
 */
class CoursesService {
  /**
   * Get all courses for the authenticated user
   */
  async getCourses(term?: string): Promise<Course[]> {
    try {
      const query = term ? `?term=${term}` : '';
      const courses = await api.get<Course[]>(`/courses${query}`);
      logger.info('Courses fetched successfully', {
        action: 'getCourses',
        metadata: { count: courses.length, term }
      });
      return courses;
    } catch (error) {
      logger.error('Failed to fetch courses', error, {
        action: 'getCourses',
        metadata: { term }
      });
      throw error;
    }
  }

  /**
   * Get a single course by ID
   */
  async getCourse(courseId: string): Promise<Course> {
    try {
      const course = await api.get<Course>(`/courses/${courseId}`);
      logger.info('Course fetched successfully', {
        action: 'getCourse',
        metadata: { courseId }
      });
      return course;
    } catch (error) {
      logger.error('Failed to fetch course', error, {
        action: 'getCourse',
        metadata: { courseId }
      });
      throw error;
    }
  }

  /**
   * Create a new course
   */
  async createCourse(data: CourseFormData): Promise<Course> {
    try {
      // Validate data
      this.validateCourseData(data);

      const course = await api.post<Course>('/courses', data);
      logger.info('Course created successfully', {
        action: 'createCourse',
        metadata: { courseName: data.name, term: data.term }
      });
      return course;
    } catch (error) {
      logger.error('Failed to create course', error, {
        action: 'createCourse',
        metadata: { courseName: data.name }
      });
      throw error;
    }
  }

  /**
   * Update an existing course
   */
  async updateCourse(courseId: string, data: Partial<CourseFormData>): Promise<Course> {
    try {
      // Validate data if provided
      if (data.name !== undefined || data.code !== undefined || data.professor !== undefined) {
        this.validateCourseData(data as CourseFormData);
      }

      const course = await api.patch<Course>(`/courses/${courseId}`, data);
      logger.info('Course updated successfully', {
        action: 'updateCourse',
        metadata: { courseId, updates: Object.keys(data) }
      });
      return course;
    } catch (error) {
      logger.error('Failed to update course', error, {
        action: 'updateCourse',
        metadata: { courseId }
      });
      throw error;
    }
  }

  /**
   * Delete a course
   */
  async deleteCourse(courseId: string): Promise<void> {
    try {
      await api.delete(`/courses/${courseId}`);
      logger.info('Course deleted successfully', {
        action: 'deleteCourse',
        metadata: { courseId }
      });
    } catch (error) {
      logger.error('Failed to delete course', error, {
        action: 'deleteCourse',
        metadata: { courseId }
      });
      throw error;
    }
  }

  /**
   * Get folders for a course
   */
  async getCourseFolders(courseId: string): Promise<CourseFolder[]> {
    try {
      const folders = await api.get<CourseFolder[]>(`/courses/${courseId}/folders`);
      logger.info('Course folders fetched successfully', {
        action: 'getCourseFolders',
        metadata: { courseId, count: folders.length }
      });
      return folders;
    } catch (error) {
      logger.error('Failed to fetch course folders', error, {
        action: 'getCourseFolders',
        metadata: { courseId }
      });
      throw error;
    }
  }

  /**
   * Create a new folder in a course
   */
  async createCourseFolder(courseId: string, name: string, parentId?: string): Promise<CourseFolder> {
    try {
      const folder = await api.post<CourseFolder>('/courses/folders', {
        course_id: courseId,
        name: name.trim(),
        parent_id: parentId || null,
      });
      logger.info('Course folder created successfully', {
        action: 'createCourseFolder',
        metadata: { courseId, folderName: name, parentId }
      });
      return folder;
    } catch (error) {
      logger.error('Failed to create course folder', error, {
        action: 'createCourseFolder',
        metadata: { courseId, folderName: name }
      });
      throw error;
    }
  }

  /**
   * Validate course data
   */
  private validateCourseData(data: CourseFormData): void {
    // Name validation
    if (data.name && (data.name.length < 2 || data.name.length > DB_LIMITS.MAX_COURSE_NAME_LENGTH)) {
      throw new Error(`Course name must be between 2 and ${DB_LIMITS.MAX_COURSE_NAME_LENGTH} characters`);
    }

    // Code validation
    if (data.code && data.code.length > DB_LIMITS.MAX_COURSE_CODE_LENGTH) {
      throw new Error(`Course code must be ${DB_LIMITS.MAX_COURSE_CODE_LENGTH} characters or less`);
    }

    // Professor validation
    if (data.professor && data.professor.length > DB_LIMITS.MAX_PROFESSOR_NAME_LENGTH) {
      throw new Error(`Professor name must be ${DB_LIMITS.MAX_PROFESSOR_NAME_LENGTH} characters or less`);
    }
  }

  /**
   * Reorder folders within a course
   */
  async reorderFolders(folders: { id: string; display_order: number }[]): Promise<void> {
    try {
      await api.patch('/courses/folders', { folders });
      logger.info('Folders reordered successfully', {
        action: 'reorderFolders',
        metadata: { count: folders.length }
      });
    } catch (error) {
      logger.error('Failed to reorder folders', error, {
        action: 'reorderFolders',
        metadata: { folderCount: folders.length }
      });
      throw error;
    }
  }

  /**
   * Delete a folder
   */
  async deleteFolder(folderId: string): Promise<void> {
    try {
      await api.delete(`/courses/folders/${folderId}`);
      logger.info('Folder deleted successfully', {
        action: 'deleteFolder',
        metadata: { folderId }
      });
    } catch (error) {
      logger.error('Failed to delete folder', error, {
        action: 'deleteFolder',
        metadata: { folderId }
      });
      throw error;
    }
  }

  /**
   * Check if user has reached course limits
   */
  async checkCourseLimits(userId: string, term?: string): Promise<{ canCreate: boolean; reason?: string }> {
    try {
      const courses = await this.getCourses();
      
      // Check total course limit
      if (courses.length >= DB_LIMITS.MAX_COURSES_PER_USER) {
        return { 
          canCreate: false, 
          reason: ERROR_MESSAGES.COURSE_LIMIT 
        };
      }

      // Check term limit if term provided
      if (term) {
        const termCourses = courses.filter(c => c.term === term);
        if (termCourses.length >= DB_LIMITS.MAX_COURSES_PER_TERM) {
          return { 
            canCreate: false, 
            reason: `You have reached the maximum of ${DB_LIMITS.MAX_COURSES_PER_TERM} courses for this term` 
          };
        }
      }

      return { canCreate: true };
    } catch (error) {
      logger.error('Failed to check course limits', error, {
        action: 'checkCourseLimits',
        metadata: { userId, term }
      });
      return { canCreate: false, reason: 'Failed to check course limits' };
    }
  }
}

// Export singleton instance
export const coursesService = new CoursesService();