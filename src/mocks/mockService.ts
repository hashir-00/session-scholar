import { Note } from '@/api/noteService';
import { mockQuizQuestions, generateMockSummary, generateMockExplanation } from './mockData';
import { mockTiming, getRandomDelay } from './mockTiming';

/**
 * Mock note service utilities for simulating backend operations
 */
export class MockNoteService {
  private static mockNotes: Note[] = [];

  /**
   * Generate a unique note ID
   */
  static generateNoteId(): string {
    return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add a note to the mock storage
   */
  static addNote(note: Note): void {
    this.mockNotes.push(note);
  }

  /**
   * Get all notes from mock storage
   */
  static getAllNotes(): Note[] {
    return [...this.mockNotes];
  }

  /**
   * Get a specific note by ID
   */
  static getNote(noteId: string): Note | undefined {
    return this.mockNotes.find(n => n.id === noteId);
  }

  /**
   * Update a note in mock storage
   */
  static updateNote(noteId: string, updates: Partial<Note>): boolean {
    const noteIndex = this.mockNotes.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
      this.mockNotes[noteIndex] = {
        ...this.mockNotes[noteIndex],
        ...updates,
      };
      return true;
    }
    return false;
  }

  /**
   * Remove a note from mock storage
   */
  static removeNote(noteId: string): boolean {
    const initialLength = this.mockNotes.length;
    this.mockNotes = this.mockNotes.filter(n => n.id !== noteId);
    return this.mockNotes.length < initialLength;
  }

  /**
   * Create a mock note from a file
   */
  static createMockNote(file: File): Note {
    const noteId = this.generateNoteId();
    return {
      id: noteId,
      filename: file.name,
      status: 'processing',
      thumbnailUrl: URL.createObjectURL(file),
      originalImageUrl: URL.createObjectURL(file),
    };
  }

  /**
   * Simulate processing completion for a note
   */
  static simulateProcessingCompletion(noteId: string, filename: string): void {
    const delay = getRandomDelay(mockTiming.upload.processingMin, mockTiming.upload.processingMax);
    
    setTimeout(() => {
      this.updateNote(noteId, {
        status: 'completed',
        summary: generateMockSummary(filename),
        // Note: explanation is not generated during upload anymore
      });
    }, delay);
  }

  /**
   * Simulate quiz generation for a note
   */
  static simulateQuizGeneration(noteId: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const delay = getRandomDelay(mockTiming.quiz.generationMin, mockTiming.quiz.generationMax);
        
        setTimeout(() => {
          const success = this.updateNote(noteId, {
            quiz: [...mockQuizQuestions],
          });
          
          if (success) {
            console.log('Mock: Quiz generated for note:', noteId);
          } else {
            console.log('Mock: Note not found for quiz generation:', noteId);
          }
          
          resolve();
        }, delay);
      }, mockTiming.quiz.initialDelay);
    });
  }

  /**
   * Simulate explanation generation for a note
   */
  static simulateExplanationGeneration(noteId: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const delay = getRandomDelay(mockTiming.explanation.generationMin, mockTiming.explanation.generationMax);
        
        setTimeout(() => {
          const success = this.updateNote(noteId, {
            explanation: generateMockExplanation(),
          });
          
          if (success) {
            console.log('Mock: Explanation generated for note:', noteId);
          } else {
            console.log('Mock: Note not found for explanation generation:', noteId);
          }
          
          resolve();
        }, delay);
      }, mockTiming.explanation.initialDelay);
    });
  }

  /**
   * Clear all mock data (useful for testing)
   */
  static clearAll(): void {
    this.mockNotes = [];
  }
}
