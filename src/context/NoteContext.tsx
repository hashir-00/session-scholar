import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Note, ConceptExplanationResponse } from '@/api/noteService';
import { useSession } from './SessionContext';
import { noteService } from '@/api/noteService';
import { useToast } from '@/hooks/use-toast';
import { config } from '@/config';

interface NoteContextType {
  notes: Note[];
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
        description: window.innerWidth < 640 
          ? "Failed to fetch notes. Try again."
          : "Failed to fetch notes. Please try again.",
        variant: "destructive",
        duration: window.innerWidth < 640 ? 2000 : 4000,
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
        
        // Check for newly completed notes before updating the state
        const justCompletedNotes = processingNotes.filter(processingNote => {
          const updatedNote = freshNotes.find(note => note.id === processingNote.id);
          return updatedNote && updatedNote.status === 'completed' && processingNote.status !== 'completed';
        });
        
        // Show notification for newly completed notes
        if (justCompletedNotes.length > 0) {
          setTimeout(() => {
            toast({
              title: "Processing complete!",
              description: window.innerWidth < 640 
                ? `${justCompletedNotes.length} note(s) processed.`
                : `${justCompletedNotes.length} note(s) have been successfully processed.`,
              duration: window.innerWidth < 640 ? 2000 : 3000,
            });
          }, 500);
        }
        
        // Update processing notes status based on fresh notes
        setProcessingNotes(prevProcessingNotes => {
          return prevProcessingNotes.map(processingNote => {
            const updatedNote = freshNotes.find(note => note.id === processingNote.id);
            if (updatedNote && updatedNote.status === 'completed') {
              // Note has completed processing, remove from processing notes
              return null;
            }
            
            if (updatedNote) {
              return {
                ...processingNote,
                status: updatedNote.status
              };
            }
            
            return processingNote;
          }).filter(Boolean); // Remove null entries (completed notes)
        });
        
        // Also update the main notes state
        setNotes(freshNotes);
        
      } catch (error) {
        console.error('Error monitoring processing status:', error);
      }
    }, config.processing.pollInterval); // Poll every few seconds

    return () => clearInterval(interval);
  }, [processingNotes, sessionId, toast]);

  const uploadNotes = useCallback(async (files: File[]): Promise<Array<{id: string, filename: string, status: string}>> => {
    try {
      setIsLoading(true);
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);
      
      const uploadResponse = await noteService.uploadNotes(files, sessionId);
      
      // Complete upload progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsUploading(false);
      
      // ONLY add to processing notes AFTER upload is complete
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
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload failed",
        description: window.innerWidth < 640 
          ? "Failed to upload notes. Try again."
          : "Failed to upload notes. Please try again.",
        variant: "destructive",
        duration: window.innerWidth < 640 ? 2000 : 4000,
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
        description: window.innerWidth < 640 
          ? "Failed to fetch note details."
          : "Failed to fetch note details.",
        variant: "destructive",
        duration: window.innerWidth < 640 ? 2000 : 4000,
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
        description: window.innerWidth < 640 
          ? "Note deleted successfully."
          : "Note has been successfully deleted.",
        duration: window.innerWidth < 640 ? 1500 : 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: window.innerWidth < 640 
          ? "Failed to delete note. Try again."
          : "Failed to delete note. Please try again.",
        variant: "destructive",
        duration: window.innerWidth < 640 ? 2000 : 4000,
      });
    }
  }, [sessionId, toast]);

  const generateQuiz = useCallback(async (noteId: string) => {
    try {
      toast({
        title: "Quiz generation started",
        description: window.innerWidth < 640 
          ? "AI is generating the quiz."
          : "AI is generating the quiz. It will be ready shortly.",
        duration: window.innerWidth < 640 ? 2000 : 3000,
      });
      await noteService.generateQuiz(noteId, sessionId);
      
      toast({
        title: "Quiz generation Completed",
        description: window.innerWidth < 640 
          ? "Quiz generated successfully."
          : "AI has generated the quiz successfully.",
        duration: window.innerWidth < 640 ? 2000 : 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: window.innerWidth < 640 
          ? "Failed to generate quiz."
          : "Failed to start quiz generation.",
        variant: "destructive",
        duration: window.innerWidth < 640 ? 2000 : 4000,
      });
    }
  }, [sessionId, toast]);

  const generateExplanation = useCallback(async (noteId: string): Promise<string | ConceptExplanationResponse> => {
    try {
      toast({
        title: "Explanation generation started",
        description: "AI is generating detailed explanations for your notes.",
      });
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
      isUploading,
      uploadProgress,
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