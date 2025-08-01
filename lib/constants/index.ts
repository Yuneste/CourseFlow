/**
 * Application-wide constants
 * Centralized location for all magic numbers, strings, and configuration values
 */

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB in bytes
  MAX_BATCH_SIZE: 20, // Maximum files per batch upload (increased for better UX)
  ALLOWED_TYPES: {
    DOCUMENTS: ['.pdf', '.doc', '.docx', '.txt', '.md'],
    SPREADSHEETS: ['.xls', '.xlsx', '.csv'],
    PRESENTATIONS: ['.ppt', '.pptx'],
    IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  },
  RATE_LIMITS: {
    IMAGE: 10,
    DOCUMENT: 20,
    DEFAULT: 15,
  },
  CHUNK_SIZE: 64 * 1024, // 64KB chunks for upload progress
} as const;

// Time delays and durations (in milliseconds)
export const DELAYS = {
  UPLOAD_COMPLETE_FADE: 2000,
  TOAST_DURATION: 4000,
  DEBOUNCE_SEARCH: 300,
  AUTO_SAVE: 5000,
  SESSION_WARNING: 5 * 60 * 1000, // 5 minutes
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
} as const;

// API rate limiting
export const RATE_LIMITS = {
  REQUESTS_PER_MINUTE: 60,
  REQUESTS_PER_HOUR: 1000,
  UPLOAD_PER_HOUR: 100,
} as const;

// Database limits
export const DB_LIMITS = {
  MAX_COURSES_PER_USER: 100,
  MAX_COURSES_PER_TERM: 20,
  MAX_FILES_PER_COURSE: 1000,
  MAX_FOLDERS_PER_COURSE: 50,
  MAX_FILE_NAME_LENGTH: 255,
  MAX_COURSE_NAME_LENGTH: 100,
  MAX_PROFESSOR_NAME_LENGTH: 100,
  MAX_COURSE_CODE_LENGTH: 20,
} as const;

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  EXPLORER: {
    NAME: 'Explorer',
    PRICE: 0,
    STORAGE_LIMIT: 500 * 1024 * 1024, // 500MB
    FEATURES: ['basic'],
  },
  SCHOLAR: {
    NAME: 'Scholar',
    PRICE: 4.99,
    STORAGE_LIMIT: 5 * 1024 * 1024 * 1024, // 5GB
    FEATURES: ['basic', 'ai-summaries', 'advanced-organization'],
  },
  MASTER: {
    NAME: 'Master',
    PRICE: 9.99,
    STORAGE_LIMIT: 20 * 1024 * 1024 * 1024, // 20GB
    FEATURES: ['basic', 'ai-summaries', 'advanced-organization', 'collaboration', 'analytics'],
  },
} as const;

// File categories
export const FILE_CATEGORIES = {
  LECTURE: 'lecture',
  ASSIGNMENT: 'assignment',
  NOTE: 'note',
  EXAM: 'exam',
  DOCUMENT: 'document',
  RESOURCE: 'resource',
  OTHER: 'other',
} as const;

// Academic systems
export const ACADEMIC_SYSTEMS = {
  ECTS_TO_CREDIT_RATIO: 2, // 1 ECTS = 0.5 US credits
  DEFAULT_CREDITS: 3,
  DEFAULT_ECTS: 6,
} as const;

// UI/UX constants
export const UI = {
  ANIMATION_DURATION: 300,
  TRANSITION_DURATION: 200,
  GRID_COLUMNS: {
    MOBILE: 1,
    TABLET: 2,
    DESKTOP: 3,
  },
  Z_INDEX: {
    MODAL: 50,
    DROPDOWN: 40,
    HEADER: 30,
    SIDEBAR: 20,
    CONTENT: 10,
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You must be logged in to perform this action.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'This file type is not supported.',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  DUPLICATE_FILE: 'A file with this name already exists.',
  COURSE_LIMIT: 'You have reached the maximum number of courses.',
  STORAGE_LIMIT: 'You have exceeded your storage limit.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: 'File uploaded successfully',
  FILE_DELETED: 'File deleted successfully',
  COURSE_CREATED: 'Course created successfully',
  COURSE_UPDATED: 'Course updated successfully',
  COURSE_DELETED: 'Course deleted successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  FOLDER_CREATED: 'Folder created successfully',
  FOLDER_DELETED: 'Folder deleted successfully',
} as const;

// Regular expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  COURSE_CODE: /^[A-Z]{2,4}\s?\d{3,4}[A-Z]?$/i,
  SAFE_FILENAME: /^[a-zA-Z0-9_\-\s.]+$/,
} as const;

// Feature flags
export const FEATURES = {
  AI_SUMMARIES: true,
  COLLABORATION: false,
  ADVANCED_ANALYTICS: false,
  REAL_TIME_SYNC: false,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  COURSES: '/api/courses',
  FILES: '/api/files',
  PROFILE: '/api/profile',
  AUTH: '/api/auth',
  ANALYTICS: '/api/analytics',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar-collapsed',
  RECENT_COURSES: 'recent-courses',
  USER_PREFERENCES: 'user-preferences',
} as const;