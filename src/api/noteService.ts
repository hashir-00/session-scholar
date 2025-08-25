import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api'; // Update with your actual API URL

export interface Note {
  id: string;
  filename: string;
  status: 'processing' | 'completed' | 'failed';
  thumbnailUrl?: string;
  originalImageUrl?: string;
  extractedText?: string;
  summary?: string;
  quiz?: QuizQuestion[];
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
  async uploadNotes(files: File[], sessionId: string): Promise<UploadResponse[]> {
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
    const response = await axios.get(`${API_BASE_URL}/notes`, {
      params: { sessionId },
    });

    return response.data;
  }

  async getNote(noteId: string, sessionId: string): Promise<Note> {
    const response = await axios.get(`${API_BASE_URL}/notes/${noteId}`, {
      params: { sessionId },
    });

    return response.data;
  }

  async deleteNote(noteId: string, sessionId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/notes/${noteId}`, {
      params: { sessionId },
    });
  }

  async generateSummary(noteId: string, sessionId: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/notes/${noteId}/generate/summary`, {
      sessionId,
    });
  }

  async generateQuiz(noteId: string, sessionId: string, type: string = 'mcq', count: number = 5): Promise<void> {
    await axios.post(`${API_BASE_URL}/notes/${noteId}/generate/quiz`, {
      sessionId,
      type,
      count,
    });
  }
}

export const noteService = new NoteService();