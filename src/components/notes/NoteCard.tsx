import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { Note } from '@/api/noteService';
import { useNotes } from '@/context/NoteContext';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
  const { deleteNote } = useNotes();

  const getStatusIcon = () => {
    switch (note.status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = () => {
    switch (note.status) {
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Ready';
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(note.id);
    }
  };

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={getStatusVariant()}>
              {getStatusLabel()}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>

        {note.thumbnailUrl ? (
          <div className="mb-3 rounded-lg overflow-hidden bg-secondary">
            <img 
              src={note.thumbnailUrl} 
              alt={note.filename}
              className="w-full h-32 object-cover"
            />
          </div>
        ) : (
          <div className="mb-3 h-32 bg-secondary rounded-lg flex items-center justify-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        <div>
          <h3 className="font-medium text-sm mb-1 truncate" title={note.filename}>
            {note.filename}
          </h3>
          
          {note.status === 'completed' && (
            <div className="flex gap-1 flex-wrap">
              {note.extractedText && (
                <Badge variant="outline" className="text-xs">
                  Text Extracted
                </Badge>
              )}
              {note.summary && (
                <Badge variant="outline" className="text-xs">
                  Summary
                </Badge>
              )}
              {note.quiz && (
                <Badge variant="outline" className="text-xs">
                  Quiz
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};