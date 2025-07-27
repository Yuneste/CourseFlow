import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/stores/useAppStore';
import { Course } from '@/types';

describe('useAppStore - Course Management', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      courses: [],
      selectedCourse: null,
      isLoadingCourses: false,
      coursesError: null,
    });
  });

  describe('setCourses', () => {
    it('should set courses and clear error', () => {
      const mockCourses: Course[] = [
        {
          id: '1',
          user_id: 'user123',
          name: 'Course 1',
          term: 'Fall 2024',
          academic_period_type: 'semester',
          color: '#3B82F6',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          user_id: 'user123',
          name: 'Course 2',
          term: 'Spring 2025',
          academic_period_type: 'semester',
          color: '#10B981',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      useAppStore.setState({ coursesError: 'Previous error' });
      useAppStore.getState().setCourses(mockCourses);

      const state = useAppStore.getState();
      expect(state.courses).toEqual(mockCourses);
      expect(state.coursesError).toBeNull();
    });
  });

  describe('addCourse', () => {
    it('should add a course to the beginning of the list', () => {
      const existingCourse: Course = {
        id: '1',
        user_id: 'user123',
        name: 'Existing Course',
        term: 'Fall 2024',
        academic_period_type: 'semester',
        color: '#3B82F6',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const newCourse: Course = {
        id: '2',
        user_id: 'user123',
        name: 'New Course',
        term: 'Fall 2024',
        academic_period_type: 'semester',
        color: '#10B981',
        created_at: new Date(),
        updated_at: new Date(),
      };

      useAppStore.setState({ courses: [existingCourse] });
      useAppStore.getState().addCourse(newCourse);

      const state = useAppStore.getState();
      expect(state.courses).toHaveLength(2);
      expect(state.courses[0]).toEqual(newCourse);
      expect(state.courses[1]).toEqual(existingCourse);
      expect(state.coursesError).toBeNull();
    });
  });

  describe('updateCourse', () => {
    it('should update an existing course', () => {
      const course: Course = {
        id: '1',
        user_id: 'user123',
        name: 'Original Name',
        term: 'Fall 2024',
        academic_period_type: 'semester',
        color: '#3B82F6',
        created_at: new Date(),
        updated_at: new Date(),
      };

      useAppStore.setState({ courses: [course] });
      useAppStore.getState().updateCourse('1', { name: 'Updated Name' });

      const state = useAppStore.getState();
      expect(state.courses[0].name).toBe('Updated Name');
      expect(state.coursesError).toBeNull();
    });

    it('should update selected course if it matches', () => {
      const course: Course = {
        id: '1',
        user_id: 'user123',
        name: 'Original Name',
        term: 'Fall 2024',
        academic_period_type: 'semester',
        color: '#3B82F6',
        created_at: new Date(),
        updated_at: new Date(),
      };

      useAppStore.setState({ 
        courses: [course],
        selectedCourse: course 
      });
      
      useAppStore.getState().updateCourse('1', { name: 'Updated Name' });

      const state = useAppStore.getState();
      expect(state.selectedCourse?.name).toBe('Updated Name');
    });

    it('should not update selected course if it does not match', () => {
      const course1: Course = {
        id: '1',
        user_id: 'user123',
        name: 'Course 1',
        term: 'Fall 2024',
        academic_period_type: 'semester',
        color: '#3B82F6',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const course2: Course = {
        id: '2',
        user_id: 'user123',
        name: 'Course 2',
        term: 'Fall 2024',
        academic_period_type: 'semester',
        color: '#10B981',
        created_at: new Date(),
        updated_at: new Date(),
      };

      useAppStore.setState({ 
        courses: [course1, course2],
        selectedCourse: course2 
      });
      
      useAppStore.getState().updateCourse('1', { name: 'Updated Name' });

      const state = useAppStore.getState();
      expect(state.selectedCourse?.name).toBe('Course 2');
    });
  });

  describe('deleteCourse', () => {
    it('should remove a course from the list', () => {
      const courses: Course[] = [
        {
          id: '1',
          user_id: 'user123',
          name: 'Course 1',
          term: 'Fall 2024',
          academic_period_type: 'semester',
          color: '#3B82F6',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          user_id: 'user123',
          name: 'Course 2',
          term: 'Fall 2024',
          academic_period_type: 'semester',
          color: '#10B981',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      useAppStore.setState({ courses });
      useAppStore.getState().deleteCourse('1');

      const state = useAppStore.getState();
      expect(state.courses).toHaveLength(1);
      expect(state.courses[0].id).toBe('2');
      expect(state.coursesError).toBeNull();
    });

    it('should clear selected course if it was deleted', () => {
      const course: Course = {
        id: '1',
        user_id: 'user123',
        name: 'Course 1',
        term: 'Fall 2024',
        academic_period_type: 'semester',
        color: '#3B82F6',
        created_at: new Date(),
        updated_at: new Date(),
      };

      useAppStore.setState({ 
        courses: [course],
        selectedCourse: course 
      });
      
      useAppStore.getState().deleteCourse('1');

      const state = useAppStore.getState();
      expect(state.selectedCourse).toBeNull();
    });
  });

  describe('getCoursesByTerm', () => {
    it('should return courses filtered by term', () => {
      const courses: Course[] = [
        {
          id: '1',
          user_id: 'user123',
          name: 'Fall Course 1',
          term: 'Fall 2024',
          academic_period_type: 'semester',
          color: '#3B82F6',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          user_id: 'user123',
          name: 'Spring Course',
          term: 'Spring 2025',
          academic_period_type: 'semester',
          color: '#10B981',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '3',
          user_id: 'user123',
          name: 'Fall Course 2',
          term: 'Fall 2024',
          academic_period_type: 'semester',
          color: '#F59E0B',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      useAppStore.setState({ courses });
      
      const fallCourses = useAppStore.getState().getCoursesByTerm('Fall 2024');
      expect(fallCourses).toHaveLength(2);
      expect(fallCourses.every(c => c.term === 'Fall 2024')).toBe(true);
    });
  });

  describe('getCourseById', () => {
    it('should return course by ID', () => {
      const courses: Course[] = [
        {
          id: '1',
          user_id: 'user123',
          name: 'Course 1',
          term: 'Fall 2024',
          academic_period_type: 'semester',
          color: '#3B82F6',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          user_id: 'user123',
          name: 'Course 2',
          term: 'Fall 2024',
          academic_period_type: 'semester',
          color: '#10B981',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      useAppStore.setState({ courses });
      
      const course = useAppStore.getState().getCourseById('2');
      expect(course?.name).toBe('Course 2');
    });

    it('should return undefined for non-existent ID', () => {
      useAppStore.setState({ courses: [] });
      
      const course = useAppStore.getState().getCourseById('non-existent');
      expect(course).toBeUndefined();
    });
  });

  describe('getTotalCredits', () => {
    it('should calculate total US credits', () => {
      const courses: Course[] = [
        {
          id: '1',
          user_id: 'user123',
          name: 'Course 1',
          term: 'Fall 2024',
          academic_period_type: 'semester',
          credits: 3,
          color: '#3B82F6',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          user_id: 'user123',
          name: 'Course 2',
          term: 'Fall 2024',
          academic_period_type: 'semester',
          credits: 4,
          color: '#10B981',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      useAppStore.setState({ courses });
      
      const total = useAppStore.getState().getTotalCredits();
      expect(total).toBe(7);
    });

    it('should convert ECTS credits to US credits', () => {
      const courses: Course[] = [
        {
          id: '1',
          user_id: 'user123',
          name: 'Course 1',
          term: 'Fall 2024',
          academic_period_type: 'semester',
          ects_credits: 6, // Should convert to 3 US credits
          color: '#3B82F6',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          user_id: 'user123',
          name: 'Course 2',
          term: 'Fall 2024',
          academic_period_type: 'semester',
          ects_credits: 8, // Should convert to 4 US credits
          color: '#10B981',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      useAppStore.setState({ courses });
      
      const total = useAppStore.getState().getTotalCredits();
      expect(total).toBe(7); // 3 + 4
    });

    it('should filter credits by term', () => {
      const courses: Course[] = [
        {
          id: '1',
          user_id: 'user123',
          name: 'Fall Course',
          term: 'Fall 2024',
          academic_period_type: 'semester',
          credits: 3,
          color: '#3B82F6',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          user_id: 'user123',
          name: 'Spring Course',
          term: 'Spring 2025',
          academic_period_type: 'semester',
          credits: 4,
          color: '#10B981',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      useAppStore.setState({ courses });
      
      const fallTotal = useAppStore.getState().getTotalCredits('Fall 2024');
      expect(fallTotal).toBe(3);
    });
  });

  describe('loading and error states', () => {
    it('should set loading state', () => {
      useAppStore.getState().setLoadingCourses(true);
      expect(useAppStore.getState().isLoadingCourses).toBe(true);
      
      useAppStore.getState().setLoadingCourses(false);
      expect(useAppStore.getState().isLoadingCourses).toBe(false);
    });

    it('should set error state', () => {
      useAppStore.getState().setCoursesError('Something went wrong');
      expect(useAppStore.getState().coursesError).toBe('Something went wrong');
      
      useAppStore.getState().setCoursesError(null);
      expect(useAppStore.getState().coursesError).toBeNull();
    });
  });
});