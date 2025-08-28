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
  filename: string;
  status: 'processing' | 'completed' | 'failed';
  thumbnailUrl?: string;
  originalImageUrl?: string;
  summary?: string;
  quiz?: BackendQuizResponse;
  explanation?: string | ConceptExplanationResponse;
  additionalContent?: AdditionalContent[];
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

    // Send files one by one to match backend API
    const uploadResponses: UploadResponse[] = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file); // Backend expects 'file' parameter
      // Note: sessionId is not used by current backend but keeping for future compatibility
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/process-image/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Transform backend response to frontend format
        const backendData: BackendUploadResponse = response.data;
        const uploadResponse: UploadResponse = {
          id: backendData.text_id, // Use text_id as the note ID
          filename: file.name, // Use original filename from file object
          status: 'processing' // Set as processing for UI consistency
        };

        uploadResponses.push(uploadResponse);

        // Store the backend response to create note later
        const note: Note = {
          id: backendData.text_id,
          filename: file.name,
          status: 'processing', // Initially set as processing even though backend has completed
          summary: backendData.summary,
          explanation: backendData.explanation,
          thumbnailUrl: URL.createObjectURL(file), // Create preview from file
          originalImageUrl: URL.createObjectURL(file) // Create preview from file
        };
        this.realNotes.push(note);
        
        // Simulate a delay before marking as completed to show AI processing
        setTimeout(() => {
          const noteIndex = this.realNotes.findIndex(n => n.id === backendData.text_id);
          if (noteIndex !== -1) {
            this.realNotes[noteIndex].status = 'completed';
          }
        }, 3000); // 3 second delay to show AI processing
        
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with other files even if one fails
      }
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
      const response = await axios.post(`${API_BASE_URL}/api/generate-quiz/`, {
        text_id: noteId,
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
      const response = await axios.post(`${API_BASE_URL}/api/generate-explanations/`, {
        text_id: noteId,
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
      
      const response = await axios.post(`${API_BASE_URL}/api/generate-notes/`, {
       text_id: id
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
}

export const noteService = new NoteService();