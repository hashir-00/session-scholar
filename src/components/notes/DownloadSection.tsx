import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, GitBranch } from 'lucide-react';
import { Note } from '@/api/noteService';

interface DownloadSectionProps {
  note: Note;
  onDownloadPDF: () => void;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({ note, onDownloadPDF }) => {
  return (
    <div className="flex items-center justify-left mb-8 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
      <div className="flex items-center gap-4">
        <Button
          onClick={onDownloadPDF}
          variant="default"
          size="lg"
          className="gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
        >
          <Download className="h-5 w-5" />
          Download PDF
        </Button>
        
        <div className="flex items-center gap-3">
          {note.summary && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300 px-3 py-1">
               Summary Ready
            </Badge>
          )}
          {note.explanation && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300 px-3 py-1">
               Explanation Ready
            </Badge>
          )}
          {note.explanation && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-300 px-3 py-1">
              <GitBranch className="h-3 w-3 mr-1" />
              Mind Map Ready
            </Badge>
          )}
          {note.quiz && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300 px-3 py-1">
               Quiz Ready
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
