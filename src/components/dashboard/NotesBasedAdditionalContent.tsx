import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, Upload } from 'lucide-react';
import { useNotes } from '@/context/NoteContext';
import { NoteAdditionalContentCard } from './NoteAdditionalContentCard';

export const NotesBasedAdditionalContent: React.FC = () => {
  const { notes } = useNotes();
  
  // Filter for completed notes that have summaries
  const processedNotes = notes.filter(note => 
    note.status === 'completed' && note.summary
  );

  // Calculate content statistics using useMemo for performance
  const { notesWithGeneratedContent, notesReadyToGenerate } = useMemo(() => {
    const withContent = processedNotes.filter(note => 
      note.additionalContent && note.additionalContent.length > 0
    ).length;
    
    const readyToGenerate = processedNotes.length - withContent;
    
    return {
      notesWithGeneratedContent: withContent,
      notesReadyToGenerate: readyToGenerate
    };
  }, [processedNotes]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
     

      {processedNotes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="max-w-md mx-auto text-center">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold flex flex-col items-center gap-2 sm:gap-3 mb-2">
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                </div>
                <span className="hidden sm:inline">AI Generated Study Materials</span>
                <span className="sm:hidden">AI Study Materials</span>
              </h2>
              <p className="text-xs sm:text-sm text-amber-700 sm:ml-0 ml-0">
                Generate personalized study materials for each of your uploaded notes
              </p>
            </div>
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-amber-900 mb-2">
              No Processed Notes Yet
            </h3>
            <p className="text-amber-700 mb-6 leading-relaxed">
              Upload and process some notes to generate personalized study materials for each one.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
              <FileText className="h-4 w-4" />
              <span>Your processed notes will appear here when ready</span>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {processedNotes.map((note, index) => (
            <NoteAdditionalContentCard
              key={note.id}
              note={note}
            />
          ))}
        </div>
      )}
      
      {processedNotes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-xs sm:text-sm text-amber-600">
            {notesWithGeneratedContent > 0 && (
              <span className="text-green-700 font-medium">
                {notesWithGeneratedContent} note{notesWithGeneratedContent !== 1 ? 's' : ''} with generated content
              </span>
            )}
            {notesWithGeneratedContent > 0 && notesReadyToGenerate > 0 && (
              <span className="mx-2">•</span>
            )}
            {notesReadyToGenerate > 0 && (
              <span>
                {notesReadyToGenerate} note{notesReadyToGenerate !== 1 ? 's' : ''} ready for content generation
              </span>
            )}
            {notesWithGeneratedContent > 0 && notesReadyToGenerate === 0 && (
              <span className="text-green-700"> - All content generated!</span>
            )}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
