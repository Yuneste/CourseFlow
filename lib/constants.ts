/**
 * Application Constants
 * Centralized constants for consistent messaging and configuration
 */

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  UNAUTHORIZED: 'You must be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_FAILED: 'Please check your input and try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_IN_USE: 'This email is already registered.',
  WEAK_PASSWORD: 'Password is too weak. Please use a stronger password.',
  
  // Courses
  COURSE_LIMIT: 'You have reached the maximum number of courses (100).',
  COURSE_TERM_LIMIT: 'You have reached the maximum number of courses for this term (20).',
  DUPLICATE_COURSE: 'A course with this name already exists in the selected term.',
  
  // Files
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed size.',
  INVALID_FILE_TYPE: 'This file type is not supported.',
  DUPLICATE_FILE: 'This file has already been uploaded.',
  UPLOAD_FAILED: 'File upload failed.',
  STORAGE_QUOTA_EXCEEDED: 'You have exceeded your storage quota.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully.',
  COURSE_CREATED: 'Course created successfully.',
  COURSE_UPDATED: 'Course updated successfully.',
  COURSE_DELETED: 'Course deleted successfully.',
  FILE_UPLOADED: 'File uploaded successfully.',
  FILE_DELETED: 'File deleted successfully.',
  FOLDER_CREATED: 'Folder created successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
} as const;

// Database Limits
export const DB_LIMITS = {
  // Course limits
  MAX_COURSES_PER_USER: 100,
  MAX_COURSES_PER_TERM: 20,
  MAX_COURSE_NAME_LENGTH: 100,
  MAX_COURSE_CODE_LENGTH: 20,
  MAX_PROFESSOR_NAME_LENGTH: 100,
  
  // File limits
  MAX_FILES_PER_USER: 1000,
  MAX_FILE_NAME_LENGTH: 255,
  MAX_FOLDER_DEPTH: 5,
  
  // General limits
  MAX_TEXT_LENGTH: 1000,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

// File Upload Configuration
export const FILE_UPLOAD = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_BATCH_SIZE: 10, // Max files per upload
  ALLOWED_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/markdown',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ],
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks for resumable uploads
} as const;

// Time Delays (in milliseconds)
export const DELAYS = {
  DEBOUNCE_SEARCH: 300,
  DEBOUNCE_INPUT: 500,
  TOAST_DURATION: 5000,
  REDIRECT_DELAY: 1000,
  UPLOAD_COMPLETE_FADE: 2000,
  SESSION_WARNING: 5 * 60 * 1000, // 5 minutes before session expires
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'courseflow_auth_token',
  USER_PREFERENCES: 'courseflow_preferences',
  THEME: 'courseflow_theme',
  UPLOAD_QUEUE: 'courseflow_upload_queue',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REGISTER: '/api/auth/register',
  RESET_PASSWORD: '/api/auth/reset-password',
  
  // Courses
  COURSES: '/api/courses',
  
  // Files
  FILES: '/api/files',
  FILE_UPLOAD: '/api/files/upload',
  
  // Profile
  PROFILE: '/api/profile',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  FILES: '/files',
  SETTINGS: '/settings',
  ONBOARDING: '/onboarding',
} as const;

// Academic Systems
export const ACADEMIC_SYSTEMS = {
  US: {
    name: 'United States',
    type: 'gpa',
    terms: ['Fall', 'Spring', 'Summer'],
  },
  CA: {
    name: 'Canada',
    type: 'gpa',
    terms: ['Fall', 'Winter', 'Summer'],
  },
  UK: {
    name: 'United Kingdom',
    type: 'uk_honours',
    terms: ['Michaelmas', 'Hilary', 'Trinity'],
  },
  DE: {
    name: 'Germany',
    type: 'ects',
    terms: ['Wintersemester', 'Sommersemester'],
  },
  NL: {
    name: 'Netherlands',
    type: 'ects',
    terms: ['Period 1', 'Period 2', 'Period 3', 'Period 4'],
  },
} as const;

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Explorer',
    price: 0,
    storage: 50 * 1024 * 1024, // 50MB
    features: ['Basic file upload', 'Course management', 'Basic organization'],
  },
  STUDENT: {
    name: 'Scholar',
    price: 4.99,
    storage: 5 * 1024 * 1024 * 1024, // 5GB
    features: ['Everything in Explorer', 'AI summaries', 'Advanced organization', 'Study groups'],
  },
  PREMIUM: {
    name: 'Master',
    price: 9.99,
    storage: 50 * 1024 * 1024 * 1024, // 50GB
    features: ['Everything in Scholar', 'Priority support', 'Advanced analytics', 'API access'],
  },
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  AI_SUMMARIES: false, // Not in MVP
  STUDY_GROUPS: false, // Not in MVP
  MOBILE_APP: false, // Not in MVP
  ADVANCED_SEARCH: false, // Not in MVP
} as const;