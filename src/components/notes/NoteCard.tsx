import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileText, Clock, CheckCircle, AlertCircle, Trash2, Brain, Sparkles, BookOpen, TriangleAlert } from 'lucide-react';
import { Note } from '@/api/noteService';
import { useNotes } from '@/context/NoteContext';
import { motion } from 'framer-motion';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
  const { deleteNote } = useNotes();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getStatusIcon = () => {
    switch (note.status) {
      case 'processing':
        return <Brain className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = () => {
    switch (note.status) {
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Ready to Study';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    switch (note.status) {
      case 'processing':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getCardStyles = () => {
    switch (note.status) {
      case 'processing':
        return 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50';
      case 'completed':
        return 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl hover:shadow-green-100';
      case 'failed':
        return 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50';
      default:
        return 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50';
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteNote(note.id);
    setShowDeleteDialog(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-300 group overflow-hidden relative ${getCardStyles()}`}
        onClick={onClick}
      >
        {/* Status indicator stripe */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          note.status === 'completed' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
          note.status === 'processing' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
          note.status === 'failed' ? 'bg-gradient-to-r from-red-400 to-pink-500' :
          'bg-gray-300'
        }`} />

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <Badge 
                variant={getStatusVariant()}
                className={`text-xs ${
                  note.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                  note.status === 'processing' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  note.status === 'failed' ? 'bg-red-100 text-red-800 border-red-200' :
                  ''
                }`}
              >
                {getStatusLabel()}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-100 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Thumbnail */}
          {note.thumbnailUrl ? (
            <div className="mb-3 rounded-xl overflow-hidden bg-secondary shadow-inner">
              <img 
                src={note.thumbnailUrl} 
                alt={note.filename}
                className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="mb-3 h-32 bg-gradient-to-br from-secondary to-secondary/70 rounded-xl flex items-center justify-center group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-300">
              <FileText className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
            </div>
          )}

          {/* Processing Progress */}
          {note.status === 'processing' && (
            <div className="mb-3 space-y-2">
              <Progress value={65} className="h-1" />
              <p className="text-xs text-blue-600 font-medium">AI Processing...</p>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-semibold text-sm truncate flex items-center gap-2" title={note.filename}>
              {note.status === 'completed' && <Sparkles className="h-3 w-3 text-yellow-500" />}
              {note.filename}
            </h3>
            
            {note.status === 'completed' && (
              <div className="space-y-2">
                <div className="flex gap-1 flex-wrap">
                  {note.extractedText && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      <FileText className="h-3 w-3 mr-1" />
                      Text
                    </Badge>
                  )}
                  {note.summary && (
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Summary
                    </Badge>
                  )}
                  {note.quiz && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      <Brain className="h-3 w-3 mr-1" />
                      Quiz
                    </Badge>
                  )}
                </div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs text-green-600 font-medium flex items-center gap-1"
                >
                  <CheckCircle className="h-3 w-3" />
                  Ready for studying
                </motion.div>
              </div>
            )}
            
            {note.status === 'failed' && (
              <p className="text-xs text-red-600 font-medium">
                Processing failed. Please try again.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-0 bg-gradient-to-br from-background to-secondary/30">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <TriangleAlert className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl text-left">Delete Note</AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-left text-muted-foreground">
              Are you sure you want to delete "{note.filename}"? This action cannot be undone and will permanently remove:
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-200">
            <ul className="space-y-2 text-sm text-red-800">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                Original note image
              </li>
              {note.extractedText && (
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                  Extracted text content
                </li>
              )}
              {note.summary && (
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                  AI-generated summary
                </li>
              )}
              {note.quiz && note.quiz.length > 0 && (
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                  Quiz questions ({note.quiz.length} questions)
                </li>
              )}
            </ul>
          </div>

          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="hover:bg-gray-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};