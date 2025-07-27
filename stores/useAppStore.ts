import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, Course, File, UploadProgress } from '@/types';

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

  // File state
  files: File[];
  uploadQueue: UploadProgress[];
  isLoadingFiles: boolean;
  filesError: string | null;
  filesLastFetched: number | null;

  // File actions
  setFiles: (files: File[]) => void;
  addFile: (file: File) => void;
  updateFile: (id: string, updates: Partial<File>) => void;
  deleteFile: (id: string) => void;
  setLoadingFiles: (loading: boolean) => void;
  setFilesError: (error: string | null) => void;

  // Upload queue actions
  addToUploadQueue: (upload: UploadProgress) => void;
  updateUploadProgress: (fileId: string, updates: Partial<UploadProgress>) => void;
  removeFromUploadQueue: (fileId: string) => void;
  clearUploadQueue: () => void;
  clearCompletedUploads: () => void;
  getUploadsByStatus: (status: UploadProgress['status']) => UploadProgress[];

  // File utility actions
  getFilesByCourse: (courseId: string) => File[];
  getFileById: (id: string) => File | undefined;
  getTotalStorageUsed: () => number;
  shouldRefetchFiles: () => boolean;
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
        files: [],
        uploadQueue: [],
        isLoadingFiles: false,
        filesError: null,
        filesLastFetched: null,

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

        // File actions
        setFiles: (files) => 
          set({ 
            files, 
            filesError: null,
            filesLastFetched: Date.now()
          }),

        addFile: (file) =>
          set((state) => ({
            files: [file, ...state.files],
            filesError: null,
          })),

        updateFile: (id, updates) =>
          set((state) => ({
            files: state.files.map((file) =>
              file.id === id ? { ...file, ...updates } : file
            ),
            filesError: null,
          })),

        deleteFile: (id) =>
          set((state) => ({
            files: state.files.filter((file) => file.id !== id),
            filesError: null,
          })),

        setLoadingFiles: (loading) => set({ isLoadingFiles: loading }),
        
        setFilesError: (error) => set({ filesError: error }),

        // Upload queue actions
        addToUploadQueue: (upload) =>
          set((state) => ({
            uploadQueue: [...state.uploadQueue, upload],
          })),

        updateUploadProgress: (fileId, updates) =>
          set((state) => ({
            uploadQueue: state.uploadQueue.map((upload) =>
              upload.fileId === fileId ? { ...upload, ...updates } : upload
            ),
          })),

        removeFromUploadQueue: (fileId) =>
          set((state) => ({
            uploadQueue: state.uploadQueue.filter((upload) => upload.fileId !== fileId),
          })),

        clearUploadQueue: () => set({ uploadQueue: [] }),

        clearCompletedUploads: () =>
          set((state) => ({
            uploadQueue: state.uploadQueue.filter((upload) => upload.status !== 'completed'),
          })),

        getUploadsByStatus: (status) => {
          const { uploadQueue } = get();
          return uploadQueue.filter((upload) => upload.status === status);
        },

        // File utility actions
        getFilesByCourse: (courseId) => {
          const { files } = get();
          return files.filter((file) => file.course_id === courseId);
        },

        getFileById: (id) => {
          const { files } = get();
          return files.find((file) => file.id === id);
        },

        getTotalStorageUsed: () => {
          const { files } = get();
          return files.reduce((total, file) => total + file.file_size, 0);
        },

        shouldRefetchFiles: () => {
          const { filesLastFetched } = get();
          if (!filesLastFetched) return true;
          
          // Cache expires after 5 minutes
          const CACHE_DURATION = 5 * 60 * 1000;
          return Date.now() - filesLastFetched > CACHE_DURATION;
        },
      }),
      {
        name: 'courseflow-app-store',
        partialize: (state) => ({
          // Only persist user, courses, and files, not loading states or errors
          user: state.user,
          courses: state.courses,
          selectedCourse: state.selectedCourse,
          coursesLastFetched: state.coursesLastFetched,
          files: state.files,
          filesLastFetched: state.filesLastFetched,
        }),
      }
    )
  )
);