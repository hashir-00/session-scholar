# SessionScholar - AI-Powered Study Assistant

A modern web application that transforms handwritten notes into interactive study materials using AI. Upload images of your notes and get automated text extraction, summaries, explanations, and interactive quiz experiences.

## 🚀 Features

- **Note Upload**: Drag-and-drop multiple image files of your handwritten notes with immediate visual feedback
- **Smart Upload Flow**: Three-stage upload process (Uploading → AI Processing → Ready to Study) with real-time status updates
- **AI Processing**: Automatic text extraction from images using OCR with intelligent error handling
- **Smart Summaries**: AI-generated concise summaries of your notes
- **Additional Study Materials**: Generate comprehensive study materials including detailed notes, key points, and learning resources
- **Interactive Content Dialog**: View full additional content details in an immersive dialog experience
- **Interactive Quizzes**: Multiple quiz formats including MCQ, Quick Q&A, and Flashcards
- **Flow-based Quiz Experience**: Step-by-step quiz navigation with immediate feedback and scoring
- **AI Explanations**: Detailed learning insights and concept explanations generated on-demand
- **Interactive Mind Maps**: Visual knowledge maps showing concept relationships and learning pathways
- **Study Materials Export**: Download comprehensive PDFs with all generated content
- **Error Handling**: Intelligent error detection with specific feedback for image quality issues
- **Session-Based**: No login required - data persists in browser sessions
- **Real-time Updates**: Live progress tracking during AI processing with automatic status transitions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Focus Mode**: Blur images during quiz to enhance learning focus

## 🛠️ Technology Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **HTTP Client**: Axios
- **Routing**: React Router DOM v6
- **State Management**: React Context API
- **UI Components**: Radix UI primitives with custom styling (shadcn/ui)
- **File Upload**: React Dropzone
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **PDF Generation**: Custom PDF generation with jsPDF

## 📁 Project Structure

```
src/
├── api/
│   └── noteService.ts          # API service layer with backend integration
├── components/
│   ├── dashboard/
│   │   ├── AdditionalContentDialog.tsx   # Full content viewing dialog
│   │   ├── AdditionalContentGrid.tsx     # Additional content display grid
│   │   ├── CompletedNotesGrid.tsx        # Completed notes display
│   │   ├── DashboardHeader.tsx           # Dashboard header component
│   │   ├── EmptyState.tsx                # Empty state UI
│   │   ├── EmptyTabState.tsx             # Tab empty state
│   │   ├── LoadingState.tsx              # Loading state UI
│   │   ├── NoteAdditionalContentCard.tsx # Individual note content card
│   │   ├── NotesBasedAdditionalContent.tsx # Notes-based content generation
│   │   ├── NotesTabs.tsx                 # Dashboard tab navigation
│   │   └── ProcessingNotesGrid.tsx       # Processing notes display
│   ├── notes/
│   │   ├── DownloadSection.tsx       # PDF download functionality
│   │   ├── ExplanationRenderer.tsx   # Renders AI explanations
│   │   ├── MindMap.tsx               # Interactive mind map visualization
│   │   ├── NoteCard.tsx              # Individual note display component
│   │   ├── NoteUploader.tsx          # File upload interface
│   │   ├── PDFGenerator.tsx          # PDF generation utility
│   │   └── TextReader.tsx            # Text-to-speech functionality
│   ├── quiz/
│   │   ├── Flashcards.tsx            # Flashcard component
│   │   ├── InteractiveQuiz.tsx       # Flow-based MCQ quiz
│   │   ├── QAAccordion.tsx           # Quick Q&A component
│   │   └── QuizComponents.tsx        # Quiz tab container
│   └── ui/                           # Reusable UI components (shadcn/ui)
├── context/
│   ├── NoteContext.tsx               # Notes state management
│   └── SessionContext.tsx            # Session management
├── config/
│   └── index.ts                      # Environment configuration
├── data/
│   ├── dashboardData.ts              # Dashboard mock data
│   └── mockExplanations.ts           # Mock explanation data
├── hooks/
│   ├── use-mobile.tsx                # Mobile detection hook
│   ├── use-toast.ts                  # Toast notification hook
│   ├── useAdditionalContent.ts       # Additional content management hook
│   └── useNotes.ts                   # Notes management hook
├── lib/
│   └── utils.ts                      # Utility functions
├── mocks/
│   ├── index.ts                      # Mock service exports
│   ├── mockAdditionalContent.ts      # Mock additional content data
│   ├── mockData.ts                   # Mock data definitions
│   ├── mockService.ts                # Mock API service
│   ├── mockTiming.ts                 # Mock timing configuration
│   └── mockUtils.ts                  # Mock utility functions
├── pages/
│   ├── Dashboard.tsx                 # Main notes library page
│   ├── Homepage.tsx                  # Landing page
│   ├── Index.tsx                     # Route index
│   ├── NoteViewer.tsx                # Individual note viewing page
│   └── NotFound.tsx                  # 404 error page
├── utils/
│   └── iconUtils.tsx                 # Icon utility functions
└── assets/                           # Static assets and images
```

## 🏗️ Architecture

### Session Management
- **Session ID Generation**: Unique session IDs created using UUID
- **Persistence**: Session data stored in browser's localStorage
- **No Authentication**: Publicly accessible, session-based approach
- **Data Isolation**: Each session maintains separate note collections

### State Management
- **SessionContext**: Manages session ID and persistence
- **NoteContext**: Handles note operations, upload, and AI generation with real-time polling
- **Local State**: Component-level state for UI interactions

### Configuration System
Centralized configuration using environment variables:
- **API Configuration**: Backend URL and endpoints
- **Development Settings**: Mock mode toggle and debugging
- **App Settings**: Title, description, and session keys
- **Upload Limits**: File size and type restrictions
- **Processing Settings**: Polling intervals and timeouts

### API Design
The application works with a Python FastAPI backend:

#### Notes Endpoints
- `POST /api/notes/upload` - Upload note images
- `GET /api/notes?sessionId={id}` - Fetch all session notes
- `GET /api/notes/{noteId}?sessionId={id}` - Get specific note details
- `DELETE /api/notes/{noteId}?sessionId={id}` - Delete a note

#### AI Generation Endpoints
- `POST /api/process-image/` - Upload and process note images with OCR
- `POST /api/notes/{noteId}/generate/summary` - Generate note summary
- `POST /api/generate-quiz/` - Generate comprehensive quiz (MCQ, QuickQA, Flashcards)
- `POST /api/generate-explanations/` - Generate detailed explanations and learning insights
- `POST /api/generate-notes/` - Generate additional study materials and content
- `POST /api/generate-additional-content/` - Create study materials based on note summaries

### Data Models

#### Note Interface
```typescript
interface Note {
  id: string;
  backendId?: string; // Real backend ID for API calls
  filename: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  thumbnailUrl?: string;
  originalImageUrl?: string;
  summary?: string;
  quiz?: BackendQuizResponse;
  explanation?: string | ConceptExplanationResponse;
  additionalContent?: AdditionalContent[];
  errorReason?: string; // Reason for failure
}
```

#### Additional Content Interface
```typescript
interface AdditionalContent {
  title: string;
  subject: string;
  description: string;
  content: string;
  keyPoints: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  lastUpdated: string;
}
```

#### Backend Quiz Response Interface
```typescript
interface BackendQuizResponse {
  MCQ: BackendMCQQuestion[];
  QuickQA: BackendQuickQA[];
  Flashcards: BackendFlashcard[];
}

interface BackendMCQQuestion {
  question: string;
  answers: BackendMCQAnswer[];
  explanation: string;
}

interface BackendMCQAnswer {
  answer: string;
  correct: boolean;
}

interface BackendQuickQA {
  correct_answer: string;
  explanation: string;
  question: string;
  other_correct_options: string[];
}

interface BackendFlashcard {
  correctanswer: string;
  question: string;
  explanation: string;
}
```

#### Concept Explanation Interface
```typescript
interface ConceptExplanationResponse {
  explanations: Array<{
    concept: string;
    explanation: string;
  }>;
  learningApproaches: string[];
  studyTips: string[];
}
```
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}
```

## 🎨 Design System

### Color Scheme

- **Primary**: Amber/Orange gradient themes for brand consistency
- **Semantic Colors**: Dynamic color theming based on quiz performance
  - Green (≥70% accuracy): Excellence theme
  - Yellow (40-69% accuracy): Good performance theme  
  - Red (<40% accuracy): Needs improvement theme
- **Status Colors**: Visual indicators for processing states
- **Dark/Light Mode**: Automatic theme switching support
- **Gradients**: Beautiful gradient overlays for visual appeal

### Typography
- **Font Family**: System font stack for optimal performance
- **Responsive Sizing**: Fluid typography that scales with viewport
- **Semantic Hierarchy**: Clear heading and text relationships

### Components
- **shadcn/ui**: Production-ready component library
- **Custom Variants**: Extended component variants for specific use cases
- **Accessibility**: WCAG compliant interactive elements
- **Animations**: Smooth transitions with Framer Motion

### Quiz Experience Design
- **Flow-based Navigation**: Step-by-step question progression
- **Immediate Feedback**: Real-time answer validation and explanations
- **Progress Tracking**: Visual progress indicators and scoring
- **Focus Mode**: Image blurring during quiz for better concentration
- **Sticky Headers**: Always-visible navigation and results summary

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd session-scholar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
# Create production build
npm run build

# Create development build
npm run build:dev

# Preview production build locally
npm run preview
```

### Environment Configuration

This project uses environment variables for configuration. See `ENVIRONMENT.md` for detailed configuration options.

Key environment variables:
- `VITE_API_BASE_URL`: Backend API endpoint (default: http://localhost:8000/api)
- `VITE_MOCK_MODE`: Enable/disable mock mode for development (default: false)
- `VITE_APP_TITLE`: Application title (default: StudyAI)
- `VITE_APP_DESCRIPTION`: Application description
- `VITE_MAX_FILE_SIZE`: Maximum upload file size in bytes (default: 10MB)
- `VITE_ALLOWED_FILE_TYPES`: Comma-separated allowed MIME types
- `VITE_PROCESSING_POLL_INTERVAL`: Polling interval for background updates (default: 3000ms)
- `VITE_PROCESSING_TIMEOUT`: Processing timeout (default: 5 minutes)
- `VITE_DEFAULT_QUIZ_COUNT`: Default number of quiz questions (default: 5)

## 🔧 Development Workflow

### Mock Mode
The application includes a comprehensive mock mode for development:
- **File Upload Simulation**: Realistic upload progress with three-stage flow (uploading → processing → completed)
- **Processing States**: Simulated AI processing with random delays and automatic status transitions
- **Error Simulation**: Mock error scenarios with specific error messages
- **Data Generation**: Mock text extraction, summaries, explanations, quizzes, and additional content
- **Persistence**: Mock data persists during development session
- **Background Polling**: Simulated real-time status updates with automatic note transitions
- **Additional Content**: Mock generation of comprehensive study materials

### Real API Integration
To connect to a real backend:
1. Set `VITE_MOCK_MODE=false` in environment variables
2. Update `VITE_API_BASE_URL` to your backend endpoint
3. Ensure backend implements the documented API endpoints
4. Backend should return the expected data structures

### Backend Integration
The frontend is designed to work with a Python FastAPI backend that:
- Handles file uploads with intelligent image processing and OCR
- Provides detailed error feedback for image quality and processing issues
- Generates AI summaries using language models
- Creates comprehensive quiz content (MCQ, QuickQA, Flashcards)
- Provides detailed explanations and learning insights
- Generates additional study materials and content based on note context
- Manages session-based data storage with automatic cleanup
- Supports real-time status updates and progress tracking

### Adding New Features

1. **Create Components**: Add new components in appropriate directories
2. **Update Context**: Extend context providers for new state
3. **Add Routes**: Register new pages in `App.tsx`
4. **Style with Design System**: Use semantic tokens from `index.css`

## 📱 User Experience Flow

1. **Landing**: User visits application homepage with feature overview
2. **Session Creation**: Automatic session ID generation on first visit
3. **Dashboard**: View uploaded notes organized in tabs (Completed, Processing)
4. **Upload Flow**: Enhanced three-stage upload process:
   - **Uploading**: Visual feedback during file upload (2 seconds)
   - **AI Processing**: Real-time processing status with intelligent error handling
   - **Ready to Study**: Automatic transition to completed state
5. **Error Handling**: Intelligent failure detection with specific error messages:
   - Image quality issues with actionable feedback
   - Network connectivity problems
   - Server error handling with retry suggestions
6. **Processing**: Real-time status updates with visual indicators and automatic polling
7. **Viewing**: Interactive note viewer with tabbed content:
   - **Summary**: AI-generated text summary with text-to-speech
   - **Explanation**: Detailed concept explanations and study tips
   - **Mind Map**: Visual knowledge map showing concept relationships
   - **Quiz**: Multiple quiz formats with flow-based navigation
8. **Additional Content**: Generate and view comprehensive study materials:
   - Create multiple study materials per note
   - View full content in immersive dialog experience
   - Access detailed study guides, key points, and learning resources
9. **AI Generation**: On-demand content creation:
   - Generate explanations with structured learning insights
   - Create comprehensive quizzes with multiple question types
   - Generate additional study materials based on note content
10. **Interactive Learning**: 
    - Flow-based quiz experience with immediate feedback
    - Dynamic scoring with performance-based color themes
    - Focus mode to blur images during quiz
    - Review all answers with explanations
11. **Export**: Download comprehensive PDFs with all generated content
12. **Study Tools**: Text-to-speech, flashcards, mind maps, and spaced repetition

## 🔒 Privacy & Security

- **No User Data**: No personal information collected or stored
- **Session-Based**: Data tied to browser sessions only
- **Local Storage**: Session IDs stored locally, not server-side
- **File Handling**: Uploaded images processed securely
- **No Tracking**: No analytics or user behavior tracking

## 🚀 Deployment

### GitHub Pages (Current Setup)
The project is configured for GitHub Pages deployment:
1. Build files are generated in `dist/` folder
2. Deployed to: `https://hashir-00.github.io/session-scholar`
3. Automatic deployment via GitHub Actions

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy `dist/` folder to your hosting provider
3. Configure server for SPA routing (all routes → `index.html`)

### Vercel/Netlify Deployment
1. Connect repository to hosting platform
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables as needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.



For support and questions:
- Review the codebase and component documentation
- Check issues and discussions in the repository
- Refer to the configuration documentation in `ENVIRONMENT.md`

---

**StudyAI** - Transform your handwritten notes into interactive study materials with the power of AI.

