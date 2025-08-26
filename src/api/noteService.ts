import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api'; // Update with your actual API URL

// Mock data for development
const MOCK_MODE = true;

export interface Note {
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

class NoteService {
  private mockNotes: Note[] = [];

  async uploadNotes(files: File[], sessionId: string): Promise<UploadResponse[]> {
    if (MOCK_MODE) {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const uploadedNotes = files.map((file) => {
        const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const mockNote: Note = {
          id: noteId,
          filename: file.name,
          status: 'processing',
          thumbnailUrl: URL.createObjectURL(file),
          originalImageUrl: URL.createObjectURL(file),
        };
        
        this.mockNotes.push(mockNote);
        
        // Simulate processing completion after 3-5 seconds
        setTimeout(() => {
          const noteIndex = this.mockNotes.findIndex(n => n.id === noteId);
          if (noteIndex !== -1) {
            this.mockNotes[noteIndex] = {
              ...this.mockNotes[noteIndex],
              status: 'completed',
              summary: `Here's an AI-generated summary of ${file.name}:\n\nThis document covers fundamental concepts essential for understanding the subject matter. The content demonstrates a systematic approach to learning with clear progression from basic principles to complex applications.\n\nKey Educational Points:\n\n• Core theoretical concepts that form the foundation of understanding\n• Practical examples bridging theory and real-world applications  \n• Critical thinking approaches for systematic problem-solving\n• Study techniques including active recall and spaced repetition\n\nThe material emphasizes connecting theoretical knowledge with practical implementation, making it ideal for comprehensive exam preparation and deeper conceptual understanding. The complexity level is intermediate, requiring foundational knowledge but remaining accessible with proper preparation.`,
              explanation: `This document appears to be focused on foundational concepts that are essential for understanding the subject matter. The content demonstrates a systematic approach to learning, with clear progression from basic principles to more complex applications.\n\nKey Educational Insights:\n\n1. **Conceptual Framework**: The material follows a logical structure that builds understanding step by step, making it ideal for students who learn best through structured progression.\n\n2. **Practical Applications**: The notes contain real-world examples that help bridge the gap between theoretical knowledge and practical implementation.\n\n3. **Critical Thinking Elements**: Several sections encourage analytical thinking and problem-solving approaches that are valuable for developing deeper understanding.\n\n4. **Study Recommendations**: Based on the content, this material would benefit from active recall techniques and spaced repetition for optimal retention.\n\nThe overall complexity level suggests this is intermediate-level material that requires some foundational knowledge but is accessible to students with proper preparation.`
            };
          }
        }, Math.random() * 2000 + 3000); // 3-5 seconds
        
        return {
          id: noteId,
          filename: file.name,
          status: 'processing'
        };
      });
      
      return uploadedNotes;
    }

    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('sessionId', sessionId);

    const response = await axios.post(`${API_BASE_URL}/notes/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async getNotes(sessionId: string): Promise<Note[]> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      return [...this.mockNotes];
    }

    const response = await axios.get(`${API_BASE_URL}/notes`, {
      params: { sessionId },
    });

    return response.data;
  }

  async getNote(noteId: string, sessionId: string): Promise<Note> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const note = this.mockNotes.find(n => n.id === noteId);
      if (!note) {
        throw new Error('Note not found');
      }
      return { ...note };
    }

    const response = await axios.get(`${API_BASE_URL}/notes/${noteId}`, {
      params: { sessionId },
    });

    return response.data;
  }

  async deleteNote(noteId: string, sessionId: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      this.mockNotes = this.mockNotes.filter(n => n.id !== noteId);
      return;
    }

    await axios.delete(`${API_BASE_URL}/notes/${noteId}`, {
      params: { sessionId },
    });
  }

  async generateSummary(noteId: string, sessionId: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate summary generation after 2-3 seconds
      setTimeout(() => {
        const noteIndex = this.mockNotes.findIndex(n => n.id === noteId);
        if (noteIndex !== -1) {
          this.mockNotes[noteIndex] = {
            ...this.mockNotes[noteIndex],
            summary: `Here's an AI-generated summary of your notes:\n\nThis document covers key concepts in the subject matter, including fundamental principles and practical applications. The main points discussed are:\n\n• Core theoretical concepts that form the foundation of understanding\n• Practical examples and real-world applications\n• Important relationships between different elements\n• Critical thinking approaches to problem-solving\n\nThe material emphasizes the importance of connecting theory with practice, and provides a comprehensive overview suitable for exam preparation and deeper study.`,
          };
        }
      }, Math.random() * 1000 + 2000); // 2-3 seconds
      
      return;
    }

    await axios.post(`${API_BASE_URL}/notes/${noteId}/generate/summary`, {
      sessionId,
    });
  }

  async generateQuiz(noteId: string, sessionId: string, type: string = 'mcq', count: number = 5): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate quiz generation after 3-4 seconds
      setTimeout(() => {
        const noteIndex = this.mockNotes.findIndex(n => n.id === noteId);
        if (noteIndex !== -1) {
          const mockQuiz: QuizQuestion[] = [
            {
              id: 'q1',
              question: 'What is the main concept discussed in these notes?',
              options: [
                'Fundamental theoretical principles',
                'Advanced mathematical equations',
                'Historical timeline events',
                'Scientific methodology'
              ],
              correctAnswer: 'Fundamental theoretical principles',
              explanation: 'The notes focus primarily on foundational concepts that support understanding of the subject matter.'
            },
            {
              id: 'q2',
              question: 'Which approach is emphasized for problem-solving?',
              options: [
                'Memorization techniques',
                'Critical thinking approaches',
                'Random trial methods',
                'Computational algorithms'
              ],
              correctAnswer: 'Critical thinking approaches',
              explanation: 'The notes highlight the importance of analytical thinking in approaching problems systematically.'
            },
            {
              id: 'q3',
              question: 'What connection is made in the material?',
              options: [
                'Theory and practice',
                'Past and future',
                'Simple and complex',
                'Local and global'
              ],
              correctAnswer: 'Theory and practice',
              explanation: 'The material emphasizes connecting theoretical knowledge with practical applications for better understanding.'
            }
          ];
          
          this.mockNotes[noteIndex] = {
            ...this.mockNotes[noteIndex],
            quiz: mockQuiz,
          };
        }
      }, Math.random() * 1000 + 3000); // 3-4 seconds
      
      return;
    }

    await axios.post(`${API_BASE_URL}/notes/${noteId}/generate/quiz`, {
      sessionId,
      type,
      count,
    });
  }
}

export const noteService = new NoteService();