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
    <div className="flex flex-col mb-6 sm:mb-8 p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 gap-3">
      {/* Download Button Row */}
      <div className="flex">
        <Button
          onClick={onDownloadPDF}
          variant="default"
          size="sm"
          className="gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 w-full sm:w-auto"
        >
          <Download className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm sm:text-base">Download PDF</span>
        </Button>
      </div>
      
      {/* Chips Row */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {note.summary && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300 px-2 sm:px-3 py-1 text-xs sm:text-sm">
             Summary Ready
          </Badge>
        )}
        {note.explanation && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300 px-2 sm:px-3 py-1 text-xs sm:text-sm">
             Explanation Ready
          </Badge>
        )}
        {note.explanation && (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-300 px-2 sm:px-3 py-1 text-xs sm:text-sm">
            <GitBranch className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Mind Map Ready</span>
            <span className="sm:hidden">Mind Map</span>
          </Badge>
        )}
        {note.quiz && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300 px-2 sm:px-3 py-1 text-xs sm:text-sm">
             Quiz Ready
          </Badge>
        )}
      </div>
    </div>
  );
};
