import React from 'react';
import { motion } from 'framer-motion';
import { Brain, BookOpen, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Note } from '@/api/noteService';
import { EmptyTabState } from './EmptyTabState';
import { ProcessingNotesGrid } from './ProcessingNotesGrid';
import { CompletedNotesGrid } from './CompletedNotesGrid';
import { mockExplanations } from '@/data/mockExplanations';
import { ExplanationGrid } from './ExplanationGrid';

interface NotesTabsProps {
  processingNotes: Note[];
  completedNotes: Note[];
  onNoteClick: (noteId: string) => void;
}

export const NotesTabs: React.FC<NotesTabsProps> = ({
  processingNotes,
  completedNotes,
  onNoteClick
}) => {
  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Tabs defaultValue="processing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-card/70 backdrop-blur-sm border shadow-lg h-12 border-amber-200/30">
          <TabsTrigger 
            value="processing" 
            className="text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            AI Processing
            {processingNotes.length > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 ml-1">
                {processingNotes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Ready to Study
            {completedNotes.length > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 ml-1">
                {completedNotes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="explanations" 
            className="text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Additional Contents
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 ml-1">
              {mockExplanations.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="processing" className="space-y-6">
          {processingNotes.length > 0 ? (
            <ProcessingNotesGrid notes={processingNotes} onNoteClick={onNoteClick} />
          ) : (
            <EmptyTabState 
              icon={<Brain className="h-12 w-12 text-amber-600" />}
              title="No notes processing"
              description="Upload some notes to see AI processing in action!"
              bgColor="bg-amber-100"
            />
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedNotes.length > 0 ? (
            <CompletedNotesGrid notes={completedNotes} onNoteClick={onNoteClick} />
          ) : (
            <EmptyTabState 
              icon={<BookOpen className="h-12 w-12 text-green-600" />}
              title="No completed notes"
              description="Your processed notes will appear here when ready!"
              bgColor="bg-green-100"
            />
          )}
        </TabsContent>

        <TabsContent value="explanations" className="space-y-6">
          <ExplanationGrid />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
