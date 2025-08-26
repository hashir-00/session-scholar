import React, { createContext, useContext, useState, useCallback } from 'react';
import { Note } from '@/api/noteService';
import { useSession } from './SessionContext';
import { noteService } from '@/api/noteService';
import { useToast } from '@/hooks/use-toast';

interface NoteContextType {
  notes: Note[];
  isLoading: boolean;
  uploadNotes: (files: File[]) => Promise<void>;
  fetchNotes: () => Promise<void>;
  fetchNote: (noteId: string) => Promise<Note | null>;
  deleteNote: (noteId: string) => Promise<void>;
  generateQuiz: (noteId: string) => Promise<void>;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  const uploadNotes = useCallback(async (files: File[]) => {
    try {
      setIsLoading(true);
      await noteService.uploadNotes(files, sessionId);
      
      toast({
        title: "Upload successful",
        description: `${files.length} note(s) uploaded and processing started.`,
      });
      
      // Refresh notes list
      await fetchNotes();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload notes. Please try again.",
        variant: "destructive",
      });
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

  return (
    <NoteContext.Provider value={{
      notes,
      isLoading,
      uploadNotes,
      fetchNotes,
      fetchNote,
      deleteNote,
      generateQuiz,
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