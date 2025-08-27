import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Note, ConceptExplanationResponse } from '@/api/noteService';
import { useSession } from './SessionContext';
import { noteService } from '@/api/noteService';
import { useToast } from '@/hooks/use-toast';
import { config } from '@/config';

interface NoteContextType {
  notes: Note[];
  isLoading: boolean;
  processingNotes: Array<{id: string, filename: string, status: string, thumbnailUrl?: string}>;
  uploadNotes: (files: File[]) => Promise<Array<{id: string, filename: string, status: string}>>;
  fetchNotes: () => Promise<void>;
  fetchNote: (noteId: string) => Promise<Note | null>;
  deleteNote: (noteId: string) => Promise<void>;
  generateQuiz: (noteId: string) => Promise<void>;
  generateExplanation: (noteId: string) => Promise<string | ConceptExplanationResponse>;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingNotes, setProcessingNotes] = useState<Array<{id: string, filename: string, status: string, thumbnailUrl?: string}>>([]);
  const { sessionId } = useSession();
  const { toast } = useToast();

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedNotes = await noteService.getNotes(sessionId);
      setNotes(fetchedNotes);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, toast]);

  // Background processing monitor
  useEffect(() => {
    if (processingNotes.length === 0) return;

    const interval = setInterval(async () => {
      try {
        // Fetch updated notes to check status
        const freshNotes = await noteService.getNotes(sessionId);
        
        // Update processing notes status based on fresh notes
        setProcessingNotes(prevProcessingNotes => {
          return prevProcessingNotes.map(processingNote => {
            const updatedNote = freshNotes.find(note => note.id === processingNote.id);
            if (updatedNote) {
              return {
                ...processingNote,
                status: updatedNote.status
              };
            }
            
            // Mock progression for development (replace with real status from fresh notes)
            if (processingNote.status === 'processing' && Math.random() > 0.7) {
              return { ...processingNote, status: 'completed' };
            }
            
            return processingNote;
          });
        });
        
        // Also update the main notes state
        setNotes(freshNotes);
        
      } catch (error) {
        console.error('Error monitoring processing status:', error);
      }
    }, config.processing.pollInterval); // Poll every few seconds

    return () => clearInterval(interval);
  }, [processingNotes.length, sessionId]);

  // Check for completion and show notifications
  useEffect(() => {
    if (processingNotes.length === 0) return;

    const allCompleted = processingNotes.every(note => note.status === 'completed');
    const completedCount = processingNotes.filter(note => note.status === 'completed').length;
    
    // Clean up when all processing is complete
    if (allCompleted) {
      setTimeout(() => {
        toast({
          title: "All processing complete!",
          description: `All ${processingNotes.length} note(s) have been successfully processed.`,
        });
        setProcessingNotes([]);
      }, 1000);
    }
  }, [processingNotes, toast]);

  const uploadNotes = useCallback(async (files: File[]): Promise<Array<{id: string, filename: string, status: string}>> => {
    try {
      setIsLoading(true);
      const uploadResponse = await noteService.uploadNotes(files, sessionId);
      
      // Add uploaded notes to processing queue for background monitoring with thumbnails
      const processingNotesWithThumbnails = uploadResponse.map((uploadedNote, index) => ({
        ...uploadedNote,
        thumbnailUrl: URL.createObjectURL(files[index]) // Create preview from original file
      }));
      
      setProcessingNotes(prev => [...prev, ...processingNotesWithThumbnails]);
      
      // Don't show toast here, let the uploader component handle it
      
      // Refresh notes list
      await fetchNotes();
      
      // Return the uploaded notes info
      return uploadResponse;
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload notes. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw so the uploader component can handle it
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, toast, fetchNotes]);

  const fetchNote = useCallback(async (noteId: string): Promise<Note | null> => {
    try {
      const note = await noteService.getNote(noteId, sessionId);
      return note;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch note details.",
        variant: "destructive",
      });
      return null;
    }
  }, [sessionId, toast]);

  const deleteNote = useCallback(async (noteId: string) => {
    try {
      await noteService.deleteNote(noteId, sessionId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      toast({
        title: "Note deleted",
        description: "Note has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    }
  }, [sessionId, toast]);

  const generateQuiz = useCallback(async (noteId: string) => {
    try {
      await noteService.generateQuiz(noteId, sessionId);
      
      toast({
        title: "Quiz generation started",
        description: "AI is generating the quiz. It will be ready shortly.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start quiz generation.",
        variant: "destructive",
      });
    }
  }, [sessionId, toast]);

  const generateExplanation = useCallback(async (noteId: string): Promise<string | ConceptExplanationResponse> => {
    try {
      const explanation = await noteService.generateExplanation(noteId, sessionId);
      
      toast({
        title: "Explanation generated successfully",
        description: "AI has generated detailed explanations for your notes.",
      });
      
      return explanation;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate explanation.",
        variant: "destructive",
      });
      throw error;
    }
  }, [sessionId, toast]);

  return (
    <NoteContext.Provider value={{
      notes,
      isLoading,
      processingNotes,
      uploadNotes,
      fetchNotes,
      fetchNote,
      deleteNote,
      generateQuiz,
      generateExplanation,
    }}>
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};