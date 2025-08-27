# Environment Configuration

This project uses environment variables for configuration. Copy `.env.example` to `.env` and update the values according to your setup.

## Available Environment Variables

### API Configuration
- `VITE_API_BASE_URL`: Base URL for the backend API (default: `http://localhost:8000/api`)

### Development Mode
- `VITE_MOCK_MODE`: Enable/disable mock mode for development (default: `false`)

### App Configuration
- `VITE_APP_TITLE`: Application title displayed in the UI (default: `StudyAI`)
- `VITE_APP_DESCRIPTION`: Application description used in UI and meta tags (default: `Transform notes into knowledge`)
- `VITE_SESSION_KEY`: Local storage key for session management (default: `studyai_session_id`)

### File Upload Configuration
- `VITE_MAX_FILE_SIZE`: Maximum file size in bytes (default: `10485760` = 10MB)
- `VITE_ALLOWED_FILE_TYPES`: Comma-separated list of allowed MIME types (default: `image/png,image/jpeg,image/webp,image/gif`)

### Processing Configuration
- `VITE_PROCESSING_POLL_INTERVAL`: Interval for polling processing status in milliseconds (default: `3000`)
- `VITE_PROCESSING_TIMEOUT`: Timeout for processing operations in milliseconds (default: `300000` = 5 minutes)

### Quiz Configuration
- `VITE_DEFAULT_QUIZ_COUNT`: Default number of quiz questions to generate (default: `5`)
- `VITE_DEFAULT_QUIZ_TYPE`: Default quiz type (default: `mcq`)

## Setup Instructions

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your specific configuration:
   ```bash
   # Example for production
   VITE_API_BASE_URL=https://your-api-domain.com/api
   VITE_APP_TITLE=YourApp
   VITE_APP_DESCRIPTION=Your custom description
   ```

3. Restart the development server to apply changes:
   ```bash
   npm run dev
   ```

## Notes

- All environment variables must be prefixed with `VITE_` to be accessible in the frontend
- Changes to environment variables require a restart of the development server
- The `config/index.ts` file provides type-safe access to all environment variables with fallback defaults
- HTML meta tags in `index.html` will automatically use the environment variables during build
