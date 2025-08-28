import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Target, Lightbulb, FileText, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdditionalContent } from '@/hooks/useAdditionalContent';
import { useNotes } from '@/context/NoteContext';
import { useToast } from '@/hooks/use-toast';

export const AdditionalContentGrid: React.FC = () => {
  const { additionalContent, isLoading, isGenerating, fetchAdditionalContent, generateMoreContent } = useAdditionalContent();
  const { notes } = useNotes();
  const { toast } = useToast();

  useEffect(() => {
    // Don't automatically fetch additional content on mount
    // Let users generate content manually
  }, []);

  const handleGenerateMore = async () => {
    // Extract summaries from completed notes
    const noteSummaries = notes
      .filter(note => note.status === 'completed' && note.summary)
      .map(note => ({
        id: note.id,
        summary: note.summary!
      }));

    if (noteSummaries.length === 0) {
      // Show info about uploading notes for better content generation
      toast({
        title: "Generating general content",
        description: window.innerWidth < 640 
          ? "Upload notes for personalized content."
          : "Upload and process some notes to get personalized study materials based on your content.",
        duration: window.innerWidth < 640 ? 2500 : 4000,
      });
    }

    await generateMoreContent(noteSummaries, { limit: 6 });
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center justify-center h-64"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-amber-700">Loading additional content...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
            </div>
            <span className="hidden sm:inline">AI Generated Explanations</span>
            <span className="sm:hidden">AI Explanations</span>
          </h2>
          {additionalContent.length > 0 && (
            <p className="text-xs sm:text-sm text-amber-700 mt-1">
              {additionalContent.length} study materials available
            </p>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1 sm:gap-2 text-sm" 
          onClick={handleGenerateMore}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
              Generating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Generate More
            </>
          )}
        </Button>
      </div>
      
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
            <div>
              <p className="font-medium text-orange-900">Generating new content...</p>
              <p className="text-sm text-orange-700">AI is analyzing your notes to create relevant study materials</p>
            </div>
          </div>
        </motion.div>
      )}

      {additionalContent.length === 0 && !isLoading && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-amber-900 mb-2">
              No Study Materials Yet
            </h3>
            <p className="text-amber-700 mb-6 leading-relaxed">
              Upload and process some notes to generate personalized study materials, or click "Generate More" for general content.
            </p>
            <Button 
              onClick={handleGenerateMore}
              disabled={isGenerating}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Generate Study Materials
            </Button>
          </div>
        </motion.div>
      )}
      
      {additionalContent.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {additionalContent.map((explanation, index) => (
            <motion.div
              key={explanation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-amber-50/70 to-orange-50/70 backdrop-blur-sm shadow-warm">
                {/* ...existing card content... */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
                      <Lightbulb className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-amber-900">{explanation.title}</h3>
                      <p className="text-sm text-orange-700 font-medium">{explanation.subject}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${
                      explanation.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                      explanation.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {explanation.difficulty}
                  </Badge>
                </div>
                
                <p className="text-amber-800 mb-4 leading-relaxed">
                  {explanation.description}
                </p>
                
                <div className="space-y-3 mb-4">
                  <h4 className="font-semibold text-amber-900 flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    Key Points:
                  </h4>
                  <ul className="space-y-1">
                    {explanation.keyPoints.map((point, pointIndex) => (
                      <li key={pointIndex} className="text-sm text-amber-700 flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-600 mt-2 flex-shrink-0"></div>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-amber-200">
                  <div className="flex items-center gap-4 text-xs text-amber-600">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {explanation.estimatedTime}
                    </span>
                    <span>Updated {explanation.lastUpdated}</span>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 px-3 text-xs border-amber-300 hover:bg-amber-50 text-amber-700">
                    Read More
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
