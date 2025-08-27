import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { NoteUploader } from '@/components/notes/NoteUploader';
import { useNotes } from '@/context/NoteContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Note } from '@/api/noteService';

// Import refactored components
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { NotesTabs } from '@/components/dashboard/NotesTabs';

const Dashboard: React.FC = () => {
  const [showUploader, setShowUploader] = useState(false);
  const { notes, fetchNotes, isLoading, processingNotes: contextProcessingNotes } = useNotes();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleNoteClick = (noteId: string) => {
    navigate(`/notes/${noteId}`);
  };

  const completedNotes = notes.filter(note => note.status === 'completed');
  const processingNotes = notes.filter(note => note.status === 'processing');
  
  // Combine context processing notes with notes array processing notes
  // Remove duplicates by checking if a processing note already exists in the main notes array
  const contextProcessingNotesToShow = contextProcessingNotes.filter(
    pNote => !notes.some(note => note.id === pNote.id)
  );
  
  const allProcessingNotes = [
    ...processingNotes, // From main notes array (full Note objects)
    ...contextProcessingNotesToShow.map(pNote => ({
      id: pNote.id,
      filename: pNote.filename,
      status: pNote.status as 'processing' | 'completed' | 'failed',
      // Use thumbnail from context if available
      thumbnailUrl: pNote.thumbnailUrl,
      originalImageUrl: pNote.thumbnailUrl,
      summary: undefined,
      quiz: undefined,
      explanation: undefined
    }))
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-50/50">
      <DashboardHeader 
        onUploadClick={() => setShowUploader(true)} 
        processingNotes={contextProcessingNotes}
      />

      <main className="container mx-auto px-4 py-8">
        {notes.length === 0 && contextProcessingNotes.length === 0 && !isLoading ? (
          <EmptyState onUploadClick={() => setShowUploader(true)} />
        ) : (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {isLoading && notes.length === 0 && contextProcessingNotes.length === 0 && <LoadingState />}
            <NotesTabs
              processingNotes={allProcessingNotes}
              completedNotes={completedNotes}
              onNoteClick={handleNoteClick}
            />
          </motion.div>
        )}
      </main>

      <Dialog open={showUploader} onOpenChange={setShowUploader}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto border-0 bg-gradient-to-br from-background to-amber-50/40" aria-describedby="upload-dialog-description">
          <div className="sr-only">
            <h2 id="upload-dialog-title">Upload Notes</h2>
            <p id="upload-dialog-description">Upload your note images to generate AI-powered study materials</p>
          </div>
          <NoteUploader onClose={() => setShowUploader(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;