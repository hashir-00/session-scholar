/**
 * Application configuration using environment variables
 * Provides type-safe access to environment variables with defaults
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  },

  // Development Configuration
  dev: {
    mockMode: import.meta.env.VITE_MOCK_MODE === 'true' || import.meta.env.NODE_ENV === 'development',
  },

  // App Configuration
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'StudyAI',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Transform notes into knowledge',
    sessionKey: import.meta.env.VITE_SESSION_KEY || 'studyai_session_id',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760'), // 10MB default
    allowedFileTypes: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/png,image/jpeg,image/webp,image/gif').split(','),
    allowedTypesMap: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif']
    } as Record<string, string[]>,
  },

  // Processing Configuration
  processing: {
    pollInterval: parseInt(import.meta.env.VITE_PROCESSING_POLL_INTERVAL || '3000'),
    timeout: parseInt(import.meta.env.VITE_PROCESSING_TIMEOUT || '300000'), // 5 minutes
  },

  // Quiz Configuration
  quiz: {
    defaultCount: parseInt(import.meta.env.VITE_DEFAULT_QUIZ_COUNT || '5'),
    defaultType: import.meta.env.VITE_DEFAULT_QUIZ_TYPE || 'mcq',
  },
} as const;

export type Config = typeof config;
