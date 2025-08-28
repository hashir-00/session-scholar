import axios from 'axios';
import { config } from '@/config';
import { MockNoteService, mockTiming, simulateApiDelay, generateMockExplanation } from '@/mocks';
import { getMockAdditionalContent, getMockAdditionalContentById, generateMockAdditionalContentFromNotes, generateMockAdditionalContentForNote } from '@/mocks/mockAdditionalContent';

const API_BASE_URL = config.api.baseUrl;

// Mock data for development
const MOCK_MODE = config.dev.mockMode;

export interface AdditionalContent {
  title: string;
  subject: string;
  description: string;
  content: string;
  keyPoints: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  lastUpdated: string;
}

export interface Note {
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

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface UploadResponse {
  id: string;
  filename: string;
  status: string;
}

// Backend response interface
interface BackendUploadResponse {
  summary: string;
  text_id: string;
  explanation: string;
}

// Backend MCQ response interfaces
export interface BackendMCQAnswer {
  answer: string;
  correct: boolean;
}

export interface BackendMCQQuestion {
  question: string;
  answers: BackendMCQAnswer[];
  explanation: string;
}

export interface BackendQuickQA{
  correct_answer: string;
  explanation: string;
  question: string;
  other_correct_options: string[];
}

export interface BackendFlashcard{
  correctanswer: string; 
  question: string;
  explanation: string;
}
export interface BackendQuizResponse {
  MCQ: BackendMCQQuestion[];
  QuickQA: BackendQuickQA[];
  Flashcards: BackendFlashcard[];
}

// Backend explanation response interface
export interface ConceptExplanationResponse {
  explanations: Array<{
    concept: string;
    explanation: string;
  }>;
  learningApproaches: string[];
  studyTips: string[];
}

// Backend additional content response interface
export interface BackendAdditionalContentResponse {
  id: string;
  notes: AdditionalContent[];
}

class NoteService {
  // Store notes for real API mode (separate from mock data)
  private realNotes: Note[] = [];

  async uploadNotes(files: File[], sessionId: string): Promise<UploadResponse[]> {
    if (MOCK_MODE) {
      // Simulate upload delay
      await simulateApiDelay(mockTiming.upload.delay);
      
      const uploadedNotes = files.map((file) => {
        const mockNote = MockNoteService.createMockNote(file);
        MockNoteService.addNote(mockNote);
        
        // Simulate processing completion
        MockNoteService.simulateProcessingCompletion(mockNote.id, file.name);
        
        return {
          id: mockNote.id,
          filename: file.name,
          status: 'processing'
        };
      });
      
      return uploadedNotes;
    }

    // Create notes immediately as uploading and return them to UI
    const uploadResponses: UploadResponse[] = [];
    
    for (const file of files) {
      // Generate a temporary ID for immediate UI display
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const uploadResponse: UploadResponse = {
        id: tempId,
        filename: file.name,
        status: 'uploading' // Start with uploading status
      };
      
      uploadResponses.push(uploadResponse);

      // Create note immediately in uploading state
      const note: Note = {
        id: tempId,
        filename: file.name,
        status: 'uploading',
        thumbnailUrl: URL.createObjectURL(file),
        originalImageUrl: URL.createObjectURL(file)
      };
      this.realNotes.push(note);

      // Start the upload and processing flow
      this.handleUploadFlow(file, tempId);
    }

    if (uploadResponses.length === 0) {
      throw new Error('No files were successfully uploaded');
    }

    return uploadResponses;
  }

  async getNotes(sessionId: string): Promise<Note[]> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      return MockNoteService.getAllNotes();
    }

    // For real backend mode, return the notes stored in memory from uploads
    // In a real implementation, this would fetch from the backend
    return [...this.realNotes];
  }

  async getNote(noteId: string, sessionId: string): Promise<Note> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const note = MockNoteService.getNote(noteId);
      if (!note) {
        throw new Error('Note not found');
      }
      return { ...note };
    }

    // For real backend mode, find the note in memory
    const note = this.realNotes.find(n => n.id === noteId);
    if (!note) {
      throw new Error('Note not found');
    }
    return { ...note };
  }

  async deleteNote(noteId: string, sessionId: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      MockNoteService.removeNote(noteId);
      return;
    }

    // For real backend mode, remove from memory
    this.realNotes = this.realNotes.filter(n => n.id !== noteId);
  }

  async generateQuiz(noteId: string, sessionId: string, type: string = config.quiz.defaultType, count: number = config.quiz.defaultCount): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use MockNoteService for quiz generation
      MockNoteService.simulateQuizGeneration(noteId);
      
      return;
    }

    // Real backend mode - make API call and update local state
    try {
      // Find the note and get the backend ID
      const note = this.realNotes.find(n => n.id === noteId);
      const backendId = note?.backendId || noteId; // Use backendId if available, fallback to noteId
      
      const response = await axios.post(`${API_BASE_URL}/api/generate-quiz/`, {
        text_id: backendId,
      });
      
      // Store the full backend quiz response
      if (response.data && (response.data.MCQ || response.data.QuickQA || response.data.Flashcards)) {
        const backendResponse = response.data as BackendQuizResponse;
        
        const noteIndex = this.realNotes.findIndex(n => n.id === noteId);
        if (noteIndex !== -1) {
          this.realNotes[noteIndex] = {
            ...this.realNotes[noteIndex],
            quiz: backendResponse,
          };
        }
      }
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      throw error;
    }
  }

  async generateExplanation(noteId: string, sessionId: string): Promise<string | ConceptExplanationResponse> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use MockNoteService for background simulation
      MockNoteService.simulateExplanationGeneration(noteId);
      
      // Return the mock explanation immediately for UI update
      const mockExplanation = generateMockExplanation();
      return mockExplanation;
    }

    // Real backend mode - make API call and return structured data directly
    try {
      // Find the note and get the backend ID
      const note = this.realNotes.find(n => n.id === noteId);
      const backendId = note?.backendId || noteId; // Use backendId if available, fallback to noteId
      
      const response = await axios.post(`${API_BASE_URL}/api/generate-explanations/`, {
        text_id: backendId,
      });
      
      if (response.data) {
        const apiResponse = response.data as ConceptExplanationResponse;
        
        // Check if we have the expected structure
        if (apiResponse.explanations || apiResponse.learningApproaches || apiResponse.studyTips) {
          // Store the structured data in local storage
          const noteIndex = this.realNotes.findIndex(n => n.id === noteId);
          if (noteIndex !== -1) {
            this.realNotes[noteIndex] = {
              ...this.realNotes[noteIndex],
              explanation: apiResponse,
            };
          }
          
          return apiResponse;
        }
        // Fallback for other response formats - return as string
        else if (typeof response.data === 'string') {
          const noteIndex = this.realNotes.findIndex(n => n.id === noteId);
          if (noteIndex !== -1) {
            this.realNotes[noteIndex] = {
              ...this.realNotes[noteIndex],
              explanation: response.data,
            };
          }
          return response.data;
        }
      }
      
      throw new Error('No explanation returned from API');
    } catch (error) {
      console.error('Failed to generate explanation:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAdditionalContent(filters?: {
    subject?: string;
    difficulty?: string;
    limit?: number;
  }, noteSummaries?: Array<{id: string, summary: string}>): Promise<AdditionalContent[]> {
    if (MOCK_MODE) {
      // Simulate network delay for mock mode
      await simulateApiDelay(mockTiming.api.getNotes);
      
      // If note summaries are provided, generate content based on them
      if (noteSummaries && noteSummaries.length > 0) {
        return generateMockAdditionalContentFromNotes(noteSummaries, filters?.limit || 6);
      }
      
      // If no note summaries and no explicit request for general content, return empty array
      // This ensures the component starts empty until user actively generates content
      return [];
    }

    // Real backend mode - make API call to generate additional content based on note summaries
    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate-additional-content/`, {
        noteSummaries: noteSummaries || [],
        filters: filters || {}
      });
      
      // Transform backend response to frontend format if needed
      return response.data as AdditionalContent[];
    } catch (error) {
      console.error('Failed to generate additional content:', error);
      throw error;
    }
  }

  async getAdditionalContentById(id: string): Promise<AdditionalContent[]> {
    if (MOCK_MODE) {
      // Simulate network delay for mock mode
      await simulateApiDelay(mockTiming.api.getNote);
      
      // First check if content already exists in the note
      const existingNote = MockNoteService.getNote(id);
      
      if (existingNote?.additionalContent && existingNote.additionalContent.length > 0) {
        return existingNote.additionalContent;
      }
      
      // Find the note by ID to get context for generation
      const note = MockNoteService.getNote(id);
      
      if (note && note.summary) {
        // Generate multiple content items based on the note's context
        const contentItems: AdditionalContent[] = [];
        
        // Generate 2-3 different types of content for each note
        for (let i = 0; i < 3; i++) {
          const content = generateMockAdditionalContentForNote(`${id}_${i}`, {
            filename: note.filename,
            summary: note.summary
          });
          contentItems.push(content);
        }
        
        // Store the generated content in the note object
        const updateResult = MockNoteService.updateNote(id, { additionalContent: contentItems });
        
        return contentItems;
      }
      
      // Fallback to existing mock data if note not found (return as array)
      const fallbackContent = getMockAdditionalContentById(id);
      return fallbackContent ? [fallbackContent] : [];
    }

    // Real backend mode - make API call to fetch specific additional content
    try {
      // First check if content already exists in the note
      const existingNote = this.realNotes.find(n => n.id === id);
      if (existingNote?.additionalContent && existingNote.additionalContent.length > 0) {
        return existingNote.additionalContent;
      }
      
      // Use backendId if available, fallback to the provided id
      const backendId = existingNote?.backendId || id;
      
      const response = await axios.post(`${API_BASE_URL}/api/generate-notes/`, {
       text_id: backendId
      });
      
      // Backend returns an object with id and notes array
      const backendResponse = response.data as BackendAdditionalContentResponse;
      
      if (!backendResponse || !backendResponse.notes) {
        throw new Error('Invalid response format from backend: missing notes array');
      }
      
      const contentItems = backendResponse.notes;
      
      if (!Array.isArray(contentItems) || contentItems.length === 0) {
        throw new Error('No content returned from backend API');
      }
      
      // Store the content in the note object
      const noteIndex = this.realNotes.findIndex(n => n.id === id);
      if (noteIndex !== -1) {
        this.realNotes[noteIndex] = {
          ...this.realNotes[noteIndex],
          additionalContent: contentItems,
        };
      }
      
      return contentItems;
    } catch (error) {
      console.error(`Failed to fetch additional content with ID ${id}:`, error);
      throw error;
    }
  }

  // Method to handle the upload flow: uploading -> processing -> completed
  private async handleUploadFlow(file: File, tempId: string): Promise<void> {
    try {
      // Show uploading state for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update to processing state
      const noteIndex = this.realNotes.findIndex(n => n.id === tempId);
      if (noteIndex !== -1) {
        this.realNotes[noteIndex] = {
          ...this.realNotes[noteIndex],
          status: 'processing',
        };
      }
      
      // Now start the actual file processing
      this.processFileInBackground(file, tempId);
      
    } catch (error) {
      console.error(`Failed to handle upload flow for ${file.name}:`, error);
      
      // Update note status to failed with error reason
      const noteIndex = this.realNotes.findIndex(n => n.id === tempId);
      if (noteIndex !== -1) {
        this.realNotes[noteIndex] = {
          ...this.realNotes[noteIndex],
          status: 'failed',
          errorReason: "Upload process failed. Please try again.",
        };
      }
      
      // Trigger error handling
      setTimeout(() => {
        this.handleProcessingError(tempId, file.name, "Upload process failed. Please try again.");
      }, 2000);
    }
  }

  // Private method to process files in the background
  private async processFileInBackground(file: File, tempId: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/process-image/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Transform backend response to frontend format
      const backendData: BackendUploadResponse = response.data;
      
      // Update the note with the real data from backend
      const noteIndex = this.realNotes.findIndex(n => n.id === tempId);
      if (noteIndex !== -1) {
        this.realNotes[noteIndex] = {
          ...this.realNotes[noteIndex],
          // Keep the temp ID for UI consistency, but store the real backend ID for API calls
          status: 'completed',
          summary: backendData.summary,
          explanation: backendData.explanation,
        };
        
        // Store the real backend ID for future API calls (quiz, explanation, etc.)
        // We'll need to modify other methods to handle this mapping
        this.realNotes[noteIndex].backendId = backendData.text_id;
      }
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error);
      
      // Determine error message based on the error type
      let errorReason = "Image cannot be processed due to lack of visibility, poor image quality, or irrelevant content that is not study material. Please try again with a clearer image of study materials.";
      
      // Check if it's a specific backend error
      if (error.response?.status === 500 &&  error.response?.data) {
        errorReason = "Image cannot be processed due to lack of visibility, poor image quality, or irrelevant content that is not study material. Please try again with a clearer image of study materials.";
      }  
      else if (error.response?.status === 500 ) {
        errorReason = "Server error occurred while processing the image. Please try again later.";
      } else if (error.code === 'NETWORK_ERROR') {
        errorReason = "Network connection error. Please check your internet connection and try again.";
      }
      
      // Update note status to failed with error reason
      const noteIndex = this.realNotes.findIndex(n => n.id === tempId);
      if (noteIndex !== -1) {
        this.realNotes[noteIndex] = {
          ...this.realNotes[noteIndex],
          status: 'failed',
          errorReason: errorReason,
        };
      }
      
      // Trigger error handling after a longer delay to allow UI to detect the failed state
      setTimeout(() => {
        this.handleProcessingError(tempId, file.name, errorReason);
      }, 3000); // Increased delay to 3 seconds
    }
  }

  // Method to handle processing errors
  private handleProcessingError(noteId: string, filename: string, errorReason: string): void {
    // Remove the failed note from the session
    this.removeNote(noteId);
    
    // The error details are logged and stored in the note object
    // The NoteContext polling will detect the failed status and show the appropriate toast
  }

  // Method to remove a note from the session
  private removeNote(noteId: string): void {
    this.realNotes = this.realNotes.filter(n => n.id !== noteId);
  }
}

export const noteService = new NoteService();