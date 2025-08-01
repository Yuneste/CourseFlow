import { api } from '@/lib/api/client';
import { Course, CourseFormData, CourseFolder } from '@/types';
import { logger } from '@/lib/services/logger.service';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, DB_LIMITS } from '@/lib/constants';

/**
 * Service for managing courses (client version without caching)
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
      if (data.name !== undefined || data.code !== undefined) {
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
   * Create a folder in a course
   */
  async createCourseFolder(courseId: string, name: string, parentId?: string): Promise<CourseFolder> {
    try {
      // Validate folder name
      if (!name || name.trim().length === 0) {
        throw new Error('This field is required');
      }
      if (name.length > 100) {
        throw new Error(`Folder name must be less than 100 characters`);
      }

      const folder = await api.post<CourseFolder>('/courses/folders', {
        courseId,
        name: name.trim(),
        parentId
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
   * Update a course folder
   */
  async updateCourseFolder(courseId: string, folderId: string, name: string): Promise<CourseFolder> {
    try {
      // Validate folder name
      if (!name || name.trim().length === 0) {
        throw new Error('This field is required');
      }
      if (name.length > 100) {
        throw new Error(`Folder name must be less than 100 characters`);
      }

      const folder = await api.patch<CourseFolder>(`/courses/folders/${folderId}`, {
        name: name.trim()
      });
      
      logger.info('Course folder updated successfully', {
        action: 'updateCourseFolder',
        metadata: { courseId, folderId, newName: name }
      });
      return folder;
    } catch (error) {
      logger.error('Failed to update course folder', error, {
        action: 'updateCourseFolder',
        metadata: { courseId, folderId }
      });
      throw error;
    }
  }

  /**
   * Delete a course folder
   */
  async deleteCourseFolder(courseId: string, folderId: string): Promise<void> {
    try {
      await api.delete(`/courses/folders/${folderId}`);
      logger.info('Course folder deleted successfully', {
        action: 'deleteCourseFolder',
        metadata: { courseId, folderId }
      });
    } catch (error) {
      logger.error('Failed to delete course folder', error, {
        action: 'deleteCourseFolder',
        metadata: { courseId, folderId }
      });
      throw error;
    }
  }

  /**
   * Reorder course folders
   */
  async reorderFolders(updates: Array<{ id: string; display_order: number }>): Promise<void> {
    try {
      await api.post('/courses/folders/reorder', { updates });
      logger.info('Folders reordered successfully', {
        action: 'reorderFolders',
        metadata: { updateCount: updates.length }
      });
    } catch (error) {
      logger.error('Failed to reorder folders', error, {
        action: 'reorderFolders'
      });
      throw error;
    }
  }

  /**
   * Delete a folder by ID
   */
  async deleteFolder(folderId: string): Promise<void> {
    try {
      await api.delete(`/folders/${folderId}`);
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
   * Validate course data
   */
  private validateCourseData(data: Partial<CourseFormData>): void {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('This field is required');
      }
      if (data.name.length > DB_LIMITS.MAX_COURSE_NAME_LENGTH) {
        throw new Error(`Course name must be less than ${DB_LIMITS.MAX_COURSE_NAME_LENGTH} characters`);
      }
    }

    if (data.code !== undefined) {
      if (!data.code || data.code.trim().length === 0) {
        throw new Error('This field is required');
      }
      if (data.code.length > DB_LIMITS.MAX_COURSE_CODE_LENGTH) {
        throw new Error(`Course code must be less than ${DB_LIMITS.MAX_COURSE_CODE_LENGTH} characters`);
      }
    }
  }
}

export const coursesService = new CoursesService();