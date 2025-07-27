import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, Course } from '@/types';

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Course state
  courses: Course[];
  selectedCourse: Course | null;
  isLoadingCourses: boolean;
  coursesError: string | null;
  coursesLastFetched: number | null;

  // Course actions
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  setSelectedCourse: (course: Course | null) => void;
  setLoadingCourses: (loading: boolean) => void;
  setCoursesError: (error: string | null) => void;

  // Utility actions
  getCoursesByTerm: (term: string) => Course[];
  getCourseById: (id: string) => Course | undefined;
  getTotalCredits: (term?: string) => number;
  shouldRefetchCourses: () => boolean;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        courses: [],
        selectedCourse: null,
        isLoadingCourses: false,
        coursesError: null,
        coursesLastFetched: null,

        // User actions
        setUser: (user) => set({ user }),

        // Course actions
        setCourses: (courses) => 
          set({ 
            courses, 
            coursesError: null,
            coursesLastFetched: Date.now()
          }),

        addCourse: (course) =>
          set((state) => ({
            courses: [course, ...state.courses],
            coursesError: null,
          })),

        updateCourse: (id, updates) =>
          set((state) => ({
            courses: state.courses.map((course) =>
              course.id === id ? { ...course, ...updates } : course
            ),
            selectedCourse:
              state.selectedCourse?.id === id
                ? { ...state.selectedCourse, ...updates }
                : state.selectedCourse,
            coursesError: null,
          })),

        deleteCourse: (id) =>
          set((state) => ({
            courses: state.courses.filter((course) => course.id !== id),
            selectedCourse:
              state.selectedCourse?.id === id ? null : state.selectedCourse,
            coursesError: null,
          })),

        setSelectedCourse: (course) => set({ selectedCourse: course }),
        
        setLoadingCourses: (loading) => set({ isLoadingCourses: loading }),
        
        setCoursesError: (error) => set({ coursesError: error }),

        // Utility actions
        getCoursesByTerm: (term) => {
          const { courses } = get();
          return courses.filter((course) => course.term === term);
        },

        getCourseById: (id) => {
          const { courses } = get();
          return courses.find((course) => course.id === id);
        },

        getTotalCredits: (term) => {
          const { courses } = get();
          const filteredCourses = term
            ? courses.filter((course) => course.term === term)
            : courses;

          return filteredCourses.reduce((total, course) => {
            if (course.credits) {
              return total + course.credits;
            } else if (course.ects_credits) {
              // Convert ECTS to US credits (rough approximation: 2 ECTS = 1 US credit)
              return total + Math.round(course.ects_credits / 2);
            }
            return total;
          }, 0);
        },

        shouldRefetchCourses: () => {
          const { coursesLastFetched } = get();
          if (!coursesLastFetched) return true;
          
          // Cache expires after 5 minutes
          const CACHE_DURATION = 5 * 60 * 1000;
          return Date.now() - coursesLastFetched > CACHE_DURATION;
        },
      }),
      {
        name: 'courseflow-app-store',
        partialize: (state) => ({
          // Only persist user and courses, not loading states or errors
          user: state.user,
          courses: state.courses,
          selectedCourse: state.selectedCourse,
          coursesLastFetched: state.coursesLastFetched,
        }),
      }
    )
  )
);