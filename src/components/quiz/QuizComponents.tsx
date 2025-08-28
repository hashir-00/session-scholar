import React from 'react';
import { HelpCircle, MessageSquare, Lightbulb, Eye, EyeOff } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackendQuizResponse } from '@/api/noteService';
import { InteractiveQuiz } from './InteractiveQuiz';
import { QAAccordion } from './QAAccordion';
import { Flashcards } from './Flashcards';

interface QuizComponentsProps {
  questions: BackendQuizResponse;
  focusMode: boolean;
  onToggleFocusMode: () => void;
}

export const QuizComponents: React.FC<QuizComponentsProps> = ({ questions, focusMode, onToggleFocusMode }) => {

  return (
    <div className="space-y-6">
      {/* Quiz Components Tabs */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-amber-50/30">
    
        <CardContent className="p-6">
          <Tabs defaultValue="interactive" className="space-y-6">
            <TabsList className="grid w-full h-full grid-cols-1 sm:grid-cols-3 bg-card/70 backdrop-blur-sm border shadow-lg min-h-12 sm:h-12 border-amber-200/30 gap-1 sm:gap-0 p-1">
              <TabsTrigger 
                value="interactive" 
                className="text-xs sm:text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white flex flex-row items-center gap-1 sm:gap-2 h-10 sm:h-auto px-2 sm:px-3 justify-center"
              >
                <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">Interactive Quiz</span>
                <span className="sm:hidden">Quiz</span>
              </TabsTrigger>
              <TabsTrigger 
                value="accordion" 
                className="text-xs sm:text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white flex flex-row items-center gap-1 sm:gap-2 h-10 sm:h-auto px-2 sm:px-3 justify-center"
              >
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">Quick Q&A</span>
                <span className="sm:hidden">Q&A</span>
              </TabsTrigger>
              <TabsTrigger 
                value="flashcards" 
                className="text-xs sm:text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white flex flex-row items-center gap-1 sm:gap-2 h-10 sm:h-auto px-2 sm:px-3 justify-center"
              >
                <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">Flashcards</span>
                <span className="sm:hidden">Cards</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="interactive" className="mt-6">
              <InteractiveQuiz questions={questions.MCQ} />
            </TabsContent>

            <TabsContent value="accordion" className="mt-6">
              <QAAccordion questions={questions.QuickQA} />
            </TabsContent>

            <TabsContent value="flashcards" className="mt-6">
              <Flashcards questions={questions.Flashcards} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
