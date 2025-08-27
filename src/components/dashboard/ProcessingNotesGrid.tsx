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

export const ProcessingNotesGrid: React.FC<ProcessingNotesGridProps> = ({ notes, onNoteClick }) => (
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
      </h2>
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
