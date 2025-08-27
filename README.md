# StudyAI - AI-Powered Study Assistant

A modern web application that transforms handwritten notes into interactive study materials using AI. Upload images of your notes and get automated text extraction, summaries, and quiz questions.

## 🚀 Features

- **Note Upload**: Drag-and-drop multiple image files of your handwritten notes
- **AI Processing**: Automatic text extraction from images using OCR
- **Smart Summaries**: AI-generated concise summaries of your notes
- **Interactive Quizzes**: Auto-generated multiple-choice questions with explanations
- **AI Explanations**: Detailed learning insights and concept explanations generated on-demand
- **Study Recommendations**: Personalized study tips and learning approaches
- **Session-Based**: No login required - data persists in browser sessions
- **Real-time Updates**: Live progress tracking during AI processing
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **HTTP Client**: Axios
- **Routing**: React Router DOM v6
- **State Management**: React Context API
- **UI Components**: Radix UI primitives with custom styling
- **File Upload**: React Dropzone
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── api/
│   └── noteService.ts          # API service layer with mock implementation
├── components/
│   ├── notes/
│   │   ├── NoteCard.tsx        # Individual note display component
│   │   └── NoteUploader.tsx    # File upload interface
│   └── ui/                     # Reusable UI components (shadcn/ui)
├── context/
│   ├── NoteContext.tsx         # Notes state management
│   └── SessionContext.tsx     # Session management
├── pages/
│   ├── Dashboard.tsx           # Main notes library page
│   ├── NoteViewer.tsx          # Individual note viewing page
│   ├── Index.tsx               # Landing page
│   └── NotFound.tsx            # 404 error page
├── hooks/
│   └── use-mobile.tsx          # Mobile detection hook
├── lib/
│   └── utils.ts                # Utility functions
└── assets/                     # Static assets and images
```

## 🏗️ Architecture

### Session Management
- **Session ID Generation**: Unique session IDs created using UUID
- **Persistence**: Session data stored in browser's localStorage
- **No Authentication**: Publicly accessible, session-based approach
- **Data Isolation**: Each session maintains separate note collections

### State Management
- **SessionContext**: Manages session ID and persistence
- **NoteContext**: Handles note operations, upload, and AI generation
- **Local State**: Component-level state for UI interactions

### API Design
The application is designed to work with a RESTful backend API:

#### Notes Endpoints
- `POST /api/notes/upload` - Upload note images
- `GET /api/notes?sessionId={id}` - Fetch all session notes
- `GET /api/notes/{noteId}?sessionId={id}` - Get specific note details
- `DELETE /api/notes/{noteId}?sessionId={id}` - Delete a note

#### AI Generation Endpoints
- `POST /api/notes/{noteId}/generate/summary` - Generate note summary
- `POST /api/notes/{noteId}/generate/quiz` - Generate quiz questions
- `POST /api/generate-explanations/` - Generate detailed explanations and learning insights

### Data Models

#### Note Interface
```typescript
interface Note {
  id: string;
  filename: string;
  status: 'processing' | 'completed' | 'failed';
  thumbnailUrl?: string;
  originalImageUrl?: string;
  extractedText?: string;
  summary?: string;
  quiz?: QuizQuestion[];
  explanation?: string;
}
```

#### Quiz Question Interface
```typescript
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
- **Primary**: Blue-based color palette for brand consistency
- **Semantic Tokens**: CSS custom properties for theming
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

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studyai
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

# Preview production build locally
npm run preview
```

### Environment Configuration

This project uses environment variables for configuration. See `ENVIRONMENT.md` for detailed configuration options.

```bash
# Copy the environment template
cp .env.example .env

# Update .env with your configuration
# Restart the development server after changes
```

Key environment variables:
- `VITE_API_BASE_URL`: Backend API endpoint
- `VITE_MOCK_MODE`: Enable/disable mock mode for development
- `VITE_APP_TITLE`: Application title
- `VITE_MAX_FILE_SIZE`: Maximum upload file size

## 🔧 Development Workflow

### Mock Mode
The application includes a comprehensive mock mode for development:
- **File Upload Simulation**: Realistic upload progress and timing
- **Processing States**: Simulated AI processing with random delays
- **Data Generation**: Mock text extraction, summaries, and quizzes
- **Persistence**: Mock data persists during development session

### Real API Integration
To connect to a real backend:
1. Update `API_BASE_URL` in `src/api/noteService.ts`
2. Set `MOCK_MODE = false`
3. Ensure backend implements the documented API endpoints

### Adding New Features

1. **Create Components**: Add new components in appropriate directories
2. **Update Context**: Extend context providers for new state
3. **Add Routes**: Register new pages in `App.tsx`
4. **Style with Design System**: Use semantic tokens from `index.css`

## 📱 User Experience Flow

1. **Landing**: User visits application
2. **Session Creation**: Automatic session ID generation
3. **Dashboard**: View uploaded notes or upload new ones
4. **Upload**: Drag-and-drop note images
5. **Processing**: Real-time status updates during AI processing
6. **Viewing**: Interactive note viewer with tabs for content
7. **AI Generation**: On-demand summary, quiz, and explanation creation
8. **Learning**: Access detailed explanations, study tips, and learning approaches
9. **Study**: Interactive quiz with answer explanations

## 🔒 Privacy & Security

- **No User Data**: No personal information collected or stored
- **Session-Based**: Data tied to browser sessions only
- **Local Storage**: Session IDs stored locally, not server-side
- **File Handling**: Uploaded images processed securely
- **No Tracking**: No analytics or user behavior tracking

## 🚀 Deployment

### Lovable Platform
1. Click "Publish" in Lovable editor
2. Application deploys to `yourapp.lovable.app`
3. Optional custom domain connection available

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy `dist/` folder to your hosting provider
3. Configure server for SPA routing (all routes → `index.html`)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the [Lovable Documentation](https://docs.lovable.dev/)
- Join the [Lovable Discord Community](https://discord.com/channels/1119885301872070706/1280461670979993613)
- Review the codebase and component documentation

---

**StudyAI** - Transform your handwritten notes into interactive study materials with the power of AI.