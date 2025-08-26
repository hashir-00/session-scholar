import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { NoteUploader } from '@/components/notes/NoteUploader';
import { useNotes } from '@/context/NoteContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Import refactored components
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { NotesTabs } from '@/components/dashboard/NotesTabs';

const Dashboard: React.FC = () => {
  const [showUploader, setShowUploader] = useState(false);
  const { notes, fetchNotes, isLoading } = useNotes();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleNoteClick = (noteId: string) => {
    navigate(`/notes/${noteId}`);
  };

  const completedNotes = notes.filter(note => note.status === 'completed');
  const processingNotes = notes.filter(note => note.status === 'processing');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-50/50">
      <DashboardHeader onUploadClick={() => setShowUploader(true)} />

      <main className="container mx-auto px-4 py-8">
        {notes.length === 0 && !isLoading ? (
          <EmptyState onUploadClick={() => setShowUploader(true)} />
        ) : (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {isLoading && <LoadingState />}
            <NotesTabs
              processingNotes={processingNotes}
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