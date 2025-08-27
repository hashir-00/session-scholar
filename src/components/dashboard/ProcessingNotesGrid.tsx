import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Brain } from 'lucide-react';
import { NoteCard } from '@/components/notes/NoteCard';
import { Note } from '@/api/noteService';

interface ProcessingNotesGridProps {
  notes: Note[];
  onNoteClick: (noteId: string) => void;
}

export const ProcessingNotesGrid: React.FC<ProcessingNotesGridProps> = ({ notes, onNoteClick }) => {
  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
          <Brain className="h-5 w-5 text-amber-600 animate-pulse" />
        </div>
        AI Processing Your Notes
        <span className="text-sm font-normal text-gray-600">
          ({notes.length} file{notes.length !== 1 ? 's' : ''})
        </span>
      </h2>
      <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
        <Loader2 className="h-4 w-4 animate-spin" />
        Processing...
      </div>
    </div>
    
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <p className="text-sm text-blue-700">
        <span className="font-medium">🤖 AI is analyzing your notes:</span> Your uploaded images are being processed to generate summaries, quizzes, and explanations. 
        Once complete, you can find the results in the <span className="font-semibold">"Ready to Study"</span> tab.
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {notes.map((note, index) => (
        <motion.div
          key={note.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <NoteCard note={note} onClick={() => onNoteClick(note.id)} />
        </motion.div>
      ))}
    </div>
  </motion.div>
);
};
