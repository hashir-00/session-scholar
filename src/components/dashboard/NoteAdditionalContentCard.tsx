import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Loader2, MessageSquare, Target, Lightbulb, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdditionalContent } from '@/hooks/useAdditionalContent';
import { useNotes } from '@/context/NoteContext';
import { Note, AdditionalContent } from '@/api/noteService';

interface NoteAdditionalContentCardProps {
  note: Note;
}

export const NoteAdditionalContentCard: React.FC<NoteAdditionalContentCardProps> = ({ note }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { getAdditionalContentById } = useAdditionalContent();
  const { fetchNotes } = useNotes();
  const { toast } = useToast();

  // Use the additional content from the note object directly
  const generatedContent = note.additionalContent || [];

  const handleGenerate = async () => {
    if (!note.summary) {
      toast({
        title: "Cannot generate content",
        description: window.innerWidth < 640 
          ? "Note summary not available yet."
          : "This note doesn't have a summary yet. Please wait for processing to complete.",
        variant: "destructive",
        duration: window.innerWidth < 640 ? 2000 : 4000,
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      toast({
        title: "Generating content",
        description: window.innerWidth < 640 
          ? `Creating materials for ${note.filename}...`
          : `AI is generating additional study materials for "${note.filename}"...`,
        duration: window.innerWidth < 640 ? 2000 : 3000,
      });

      // Use the note's ID to generate content
      const content = await getAdditionalContentById(note.id);
      
      if (content && content.length > 0) {
        // Content is automatically stored in the note object by the service
        // Refresh the notes to get the updated note with additional content
        await fetchNotes();
        
        toast({
          title: "Content generated successfully",
          description: window.innerWidth < 640 
            ? `${content.length} study materials ready for ${note.filename}`
            : `Generated ${content.length} additional study materials for "${note.filename}"`,
          duration: window.innerWidth < 640 ? 2000 : 3000,
        });
      } else {
        throw new Error('No content returned');
      }
    } catch (error) {
      console.error('Failed to generate content:', error);
      toast({
        title: "Generation failed",
        description: window.innerWidth < 640 
          ? "Failed to generate content. Try again."
          : "Failed to generate additional content for this note. Please try again.",
        variant: "destructive",
        duration: window.innerWidth < 640 ? 2000 : 4000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-amber-50/70 to-orange-50/70 backdrop-blur-sm shadow-warm">
        <CardContent className="p-4 sm:p-6">
          {/* Note Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-amber-900 truncate">
                  {note.filename}
                </h3>
                <Badge 
                  variant={note.status === 'completed' ? 'default' : 'secondary'} 
                  className="text-xs mt-1"
                >
                  {note.status}
                </Badge>
                {note.summary && (
                  <p className="text-xs sm:text-sm text-amber-700 mt-2 overflow-hidden" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {note.summary.substring(0, 100)}...
                  </p>
                )}
              </div>
            </div>
            
            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || note.status !== 'completed' || !note.summary || generatedContent.length > 0}
              size="sm"
              className={`ml-3 gap-1 sm:gap-2 flex-shrink-0 ${
                generatedContent.length > 0 
                  ? 'bg-green-600 hover:bg-green-700 text-white cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                  <span className="sm:hidden">Gen...</span>
                </>
              ) : generatedContent.length > 0 ? (
                <>
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Generated</span>
                  <span className="sm:hidden">Done</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Generate</span>
                  <span className="sm:hidden">Gen</span>
                </>
              )}
            </Button>
          </div>

          {/* Generated Content Display */}
          {generatedContent.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="border-t border-amber-200 pt-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-amber-900 text-sm flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-orange-600" />
                    Generated Study Materials ({generatedContent.length})
                  </h4>
                </div>
                
                {generatedContent.map((content, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-white/80 to-amber-50/80 rounded-lg p-4 border border-amber-200/50"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <h5 className="font-semibold text-amber-900 text-sm flex-1">
                        {content.title}
                      </h5>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          content.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                          content.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {content.difficulty}
                      </Badge>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-amber-800 mb-3 leading-relaxed">
                      {content.description}
                    </p>
                    
                    {content.keyPoints && content.keyPoints.length > 0 && (
                      <div className="space-y-2">
                        <h6 className="font-medium text-amber-900 flex items-center gap-1 text-xs sm:text-sm">
                          <Target className="h-3 w-3 text-orange-600" />
                          Key Points:
                        </h6>
                        <ul className="space-y-1">
                          {content.keyPoints.slice(0, 3).map((point: string, pointIndex: number) => (
                            <li key={pointIndex} className="text-xs sm:text-sm text-amber-700 flex items-start gap-2">
                              <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-orange-600 mt-1.5 sm:mt-2 flex-shrink-0"></div>
                              {point}
                            </li>
                          ))}
                          {content.keyPoints.length > 3 && (
                            <li className="text-xs text-amber-600 italic">
                              +{content.keyPoints.length - 3} more points...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-amber-200/50">
                      <div className="flex items-center gap-2 text-xs text-amber-600">
                        <MessageSquare className="h-3 w-3" />
                        <span>{content.estimatedTime || '5 min read'}</span>
                      </div>
                      <Button size="sm" variant="outline" className="h-6 px-2 text-xs border-amber-300 hover:bg-amber-50 text-amber-700">
                        View Full
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
