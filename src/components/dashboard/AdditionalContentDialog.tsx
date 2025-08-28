import React from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, Clock, Target, Lightbulb, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdditionalContent } from '@/api/noteService';

interface AdditionalContentDialogProps {
  content: AdditionalContent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdditionalContentDialog: React.FC<AdditionalContentDialogProps> = ({
  content,
  open,
  onOpenChange,
}) => {
  if (!content) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900 pr-8">
              {content.title}
            </DialogTitle>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
              <BookOpen className="h-3 w-3 mr-1" />
              {content.subject}
            </Badge>
            <Badge className={getDifficultyColor(content.difficulty)}>
              <Target className="h-3 w-3 mr-1" />
              {content.difficulty}
            </Badge>
            <Badge variant="outline" className="text-gray-600">
              <Clock className="h-3 w-3 mr-1" />
              {content.estimatedTime}
            </Badge>
            <span className="text-sm text-gray-500">
              Updated {content.lastUpdated}
            </span>
          </div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 mt-6"
        >
          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Overview
            </h3>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
              {content.description}
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Content
            </h3>
            <div className="prose max-w-none bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {content.content}
              </div>
            </div>
          </div>

          {/* Key Points */}
          {content.keyPoints && content.keyPoints.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Key Points
              </h3>
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-lg border border-yellow-200">
                <ul className="space-y-2">
                  {content.keyPoints.map((point, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="leading-relaxed">{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="min-w-[100px]"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
