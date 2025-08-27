import axios from 'axios';
import { config } from '@/config';
import { MockNoteService, mockTiming, simulateApiDelay, generateMockExplanation } from '@/mocks';

const API_BASE_URL = config.api.baseUrl;

// Mock data for development
const MOCK_MODE = config.dev.mockMode;

export interface Note {
  id: string;
  filename: string;
  status: 'processing' | 'completed' | 'failed';
  thumbnailUrl?: string;
  originalImageUrl?: string;
  summary?: string;
  quiz?: QuizQuestion[];
  explanation?: string | ConceptExplanationResponse;
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

// Backend explanation response interface
export interface ConceptExplanationResponse {
  explanations: Array<{
    concept: string;
    explanation: string;
  }>;
  learningApproaches: string[];
  studyTips: string[];
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
    console.log('Real API: Getting note for noteId:', noteId);
    console.log('Real API: Found note:', note ? 'yes' : 'no');
    if (note) {
      console.log('Real API: Note has explanation:', !!note.explanation);
      if (note.explanation) {
        const explanationLength = typeof note.explanation === 'string' 
          ? note.explanation.length 
          : JSON.stringify(note.explanation).length;
        console.log('Real API: Explanation length:', explanationLength);
      }
    }
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
      const response = await axios.post(`${API_BASE_URL}/notes/${noteId}/generate/quiz`, {
        sessionId,
        type,
        count,
      });
      
      // Update the local note with the quiz from the response
      if (response.data && response.data.quiz) {
        const noteIndex = this.realNotes.findIndex(n => n.id === noteId);
        if (noteIndex !== -1) {
          this.realNotes[noteIndex] = {
            ...this.realNotes[noteIndex],
            quiz: response.data.quiz,
          };
          console.log('Real API: Note updated with quiz for noteId:', noteId);
        } else {
          console.log('Real API: Note not found for noteId:', noteId);
        }
      } else {
        console.log('Real API: No quiz in response for noteId:', noteId);
      }
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      throw error;
    }
  }

  async generateExplanation(noteId: string, sessionId: string): Promise<string | ConceptExplanationResponse> {
    if (MOCK_MODE) {
      console.log('Starting explanation generation in mock mode for noteId:', noteId);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use MockNoteService for background simulation
      MockNoteService.simulateExplanationGeneration(noteId);
      
      // Return the mock explanation immediately for UI update
      const mockExplanation = generateMockExplanation();
      return mockExplanation;
    }

    // Real backend mode - make API call and return structured data directly
    try {
      console.log('Real API: Generating explanation for noteId:', noteId);
      const response = await axios.post(`${API_BASE_URL}/api/generate-explanations/`, {
        text_id: noteId,
      });
      
      console.log('Real API: Response received:', response.data);
      
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
            console.log('Real API: Note updated with structured explanation for noteId:', noteId);
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
      
      console.log('Real API: No valid explanation found in response for noteId:', noteId);
      throw new Error('No explanation returned from API');
    } catch (error) {
      console.error('Failed to generate explanation:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const noteService = new NoteService();