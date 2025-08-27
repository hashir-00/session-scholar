import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { NoteUploader } from '@/components/notes/NoteUploader';
import { useNotes } from '@/context/NoteContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Note } from '@/api/noteService';

// Import refactored components
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { NotesTabs } from '@/components/dashboard/NotesTabs';

const Dashboard: React.FC = () => {
  const [showUploader, setShowUploader] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [cameFromUpload, setCameFromUpload] = useState(false);
  const { notes, fetchNotes, isLoading, isUploading, uploadProgress, processingNotes: contextProcessingNotes } = useNotes();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Check if user is coming from upload and store it persistently
  useEffect(() => {
    const fromUpload = searchParams.get('from') === 'upload';
    if (fromUpload) {
      setCameFromUpload(true);
      // Store in session storage as backup
      sessionStorage.setItem('dashboardUploadAccess', 'true');
    } else {
      // Check session storage on load
      const hasStoredAccess = sessionStorage.getItem('dashboardUploadAccess') === 'true';
      if (hasStoredAccess) {
        setCameFromUpload(true);
      }
    }
  }, [searchParams]);

  // Give some time for processing notes to appear before blocking access
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoadComplete(true);
      // Clean up URL parameter after initial load
      if (searchParams.get('from') === 'upload') {
        setSearchParams({});
      }
    }, cameFromUpload ? 8000 : 2000); // Give more time if coming from upload

    return () => clearTimeout(timer);
  }, [cameFromUpload, setSearchParams, searchParams]);

  // Only redirect after initial load is complete and there's clearly no activity
  // Don't redirect if user came from upload or if there are any notes/processing
  useEffect(() => {
    const hasAnyActivity = notes.length > 0 || contextProcessingNotes.length > 0 || cameFromUpload;
    
    // Clear session storage once we have actual activity (notes or processing)
    if (notes.length > 0 || contextProcessingNotes.length > 0) {
      sessionStorage.removeItem('dashboardUploadAccess');
    }
    
    if (initialLoadComplete && !isLoading && !hasAnyActivity) {
      // Clear session storage before redirect
      sessionStorage.removeItem('dashboardUploadAccess');
      navigate('/', { replace: true });
    }
  }, [initialLoadComplete, isLoading, notes.length, contextProcessingNotes.length, navigate, cameFromUpload]);

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
      thumbnailUrl: pNote.thumbnailUrl, // Preserve the blob URL
      originalImageUrl: pNote.thumbnailUrl,
      summary: undefined,
      quiz: undefined,
      explanation: undefined
    } as Note))
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-50/50">
      <DashboardHeader 
        onUploadClick={() => setShowUploader(true)} 
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        processingNotes={contextProcessingNotes}
        completedNotes={completedNotes}
      />

      <main className="container mx-auto px-4 py-8">
        {isLoading && notes.length === 0 && contextProcessingNotes.length === 0 ? (
          <LoadingState />
        ) : (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
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
          <NoteUploader onClose={() => {
            setShowUploader(false);
            // Don't immediately fetch notes - let the background processing handle it
            // fetchNotes will be called by the processing monitor in NoteContext
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;