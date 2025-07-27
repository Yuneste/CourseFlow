import { describe, it, expect, vi, beforeEach } from 'vitest';
import { coursesService } from '@/lib/services/courses.service';
import { api } from '@/lib/api/client';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('coursesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCourses', () => {
    it('should fetch all courses', async () => {
      const mockCourses = [
        { id: '1', name: 'Course 1', term: 'Fall 2024' },
        { id: '2', name: 'Course 2', term: 'Spring 2025' },
      ];
      vi.mocked(api.get).mockResolvedValue(mockCourses);

      const result = await coursesService.getCourses();

      expect(api.get).toHaveBeenCalledWith('/courses', undefined);
      expect(result).toEqual(mockCourses);
    });

    it('should fetch courses filtered by term', async () => {
      const mockCourses = [
        { id: '1', name: 'Course 1', term: 'Fall 2024' },
      ];
      vi.mocked(api.get).mockResolvedValue(mockCourses);

      const result = await coursesService.getCourses('Fall 2024');

      expect(api.get).toHaveBeenCalledWith('/courses', { term: 'Fall 2024' });
      expect(result).toEqual(mockCourses);
    });
  });

  describe('createCourse', () => {
    it('should validate required fields', async () => {
      await expect(
        coursesService.createCourse({ name: '', term: 'Fall 2024' })
      ).rejects.toThrow('Course name and term are required');

      await expect(
        coursesService.createCourse({ name: 'Test', term: '' })
      ).rejects.toThrow('Course name and term are required');
    });

    it('should validate name length', async () => {
      await expect(
        coursesService.createCourse({ name: 'A', term: 'Fall 2024' })
      ).rejects.toThrow('Course name must be between 2 and 100 characters');

      await expect(
        coursesService.createCourse({ 
          name: 'A'.repeat(101), 
          term: 'Fall 2024' 
        })
      ).rejects.toThrow('Course name must be between 2 and 100 characters');
    });

    it('should validate code length', async () => {
      await expect(
        coursesService.createCourse({ 
          name: 'Test Course', 
          term: 'Fall 2024',
          code: 'A'.repeat(21)
        })
      ).rejects.toThrow('Course code must be 20 characters or less');
    });

    it('should validate professor length', async () => {
      await expect(
        coursesService.createCourse({ 
          name: 'Test Course', 
          term: 'Fall 2024',
          professor: 'A'.repeat(101)
        })
      ).rejects.toThrow('Professor name must be 100 characters or less');
    });

    it('should create a course successfully', async () => {
      const newCourse = {
        id: '1',
        name: 'Test Course',
        term: 'Fall 2024',
        color: '#3B82F6',
      };
      vi.mocked(api.post).mockResolvedValue(newCourse);

      const result = await coursesService.createCourse({
        name: 'Test Course',
        term: 'Fall 2024',
      });

      expect(api.post).toHaveBeenCalledWith('/courses', {
        name: 'Test Course',
        term: 'Fall 2024',
      });
      expect(result).toEqual(newCourse);
    });
  });

  describe('updateCourse', () => {
    it('should validate name if provided', async () => {
      await expect(
        coursesService.updateCourse('1', { name: 'A' })
      ).rejects.toThrow('Course name must be between 2 and 100 characters');
    });

    it('should update a course successfully', async () => {
      const updatedCourse = {
        id: '1',
        name: 'Updated Course',
        term: 'Fall 2024',
      };
      vi.mocked(api.put).mockResolvedValue(updatedCourse);

      const result = await coursesService.updateCourse('1', {
        name: 'Updated Course',
      });

      expect(api.put).toHaveBeenCalledWith('/courses/1', {
        name: 'Updated Course',
      });
      expect(result).toEqual(updatedCourse);
    });
  });

  describe('deleteCourse', () => {
    it('should delete a course', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);

      await coursesService.deleteCourse('1');

      expect(api.delete).toHaveBeenCalledWith('/courses/1');
    });
  });

  describe('isDuplicateCourse', () => {
    it('should return true if duplicate exists', async () => {
      const mockCourses = [
        { id: '1', name: 'Test Course', term: 'Fall 2024' },
        { id: '2', name: 'Another Course', term: 'Fall 2024' },
      ];
      vi.mocked(api.get).mockResolvedValue(mockCourses);

      const result = await coursesService.isDuplicateCourse(
        'test course', // Should be case-insensitive
        'Fall 2024'
      );

      expect(result).toBe(true);
    });

    it('should return false if no duplicate exists', async () => {
      const mockCourses = [
        { id: '1', name: 'Different Course', term: 'Fall 2024' },
      ];
      vi.mocked(api.get).mockResolvedValue(mockCourses);

      const result = await coursesService.isDuplicateCourse(
        'Test Course',
        'Fall 2024'
      );

      expect(result).toBe(false);
    });

    it('should exclude specified course ID', async () => {
      const mockCourses = [
        { id: '1', name: 'Test Course', term: 'Fall 2024' },
      ];
      vi.mocked(api.get).mockResolvedValue(mockCourses);

      const result = await coursesService.isDuplicateCourse(
        'Test Course',
        'Fall 2024',
        '1' // Exclude this ID
      );

      expect(result).toBe(false);
    });
  });

  describe('getCoursesByTerm', () => {
    it('should group courses by term', async () => {
      const mockCourses = [
        { id: '1', name: 'Course 1', term: 'Fall 2024' },
        { id: '2', name: 'Course 2', term: 'Fall 2024' },
        { id: '3', name: 'Course 3', term: 'Spring 2025' },
      ];
      vi.mocked(api.get).mockResolvedValue(mockCourses);

      const result = await coursesService.getCoursesByTerm();

      expect(result).toEqual({
        'Fall 2024': [
          { id: '1', name: 'Course 1', term: 'Fall 2024' },
          { id: '2', name: 'Course 2', term: 'Fall 2024' },
        ],
        'Spring 2025': [
          { id: '3', name: 'Course 3', term: 'Spring 2025' },
        ],
      });
    });
  });

  describe('getCourseStats', () => {
    it('should calculate course statistics', async () => {
      const mockCourses = [
        { id: '1', name: 'Course 1', term: 'Fall 2024', credits: 3 },
        { id: '2', name: 'Course 2', term: 'Fall 2024', credits: 4 },
        { id: '3', name: 'Course 3', term: 'Spring 2025', ects_credits: 6 },
      ];
      vi.mocked(api.get).mockResolvedValue(mockCourses);

      const result = await coursesService.getCourseStats();

      expect(result).toEqual({
        totalCourses: 3,
        coursesByTerm: {
          'Fall 2024': 2,
          'Spring 2025': 1,
        },
        creditsByTerm: {
          'Fall 2024': 7,
          'Spring 2025': 3, // 6 ECTS ≈ 3 US credits
        },
      });
    });
  });
});