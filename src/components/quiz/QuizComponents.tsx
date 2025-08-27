import React from 'react';
import { HelpCircle, MessageSquare, Lightbulb, Eye, EyeOff } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuizQuestion } from '@/api/noteService';
import { InteractiveQuiz } from './InteractiveQuiz';
import { QAAccordion } from './QAAccordion';
import { Flashcards } from './Flashcards';

interface QuizComponentsProps {
  questions: QuizQuestion[];
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
            <TabsList className="grid w-full grid-cols-3 bg-card/70 backdrop-blur-sm border shadow-lg h-12 border-amber-200/30">
              <TabsTrigger 
                value="interactive" 
                className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white flex items-center gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Interactive Quiz
              </TabsTrigger>
              <TabsTrigger 
                value="accordion" 
                className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Quick Q&A
              </TabsTrigger>
              <TabsTrigger 
                value="flashcards" 
                className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white flex items-center gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                Flashcards
              </TabsTrigger>
            </TabsList>

            <TabsContent value="interactive" className="mt-6">
              <InteractiveQuiz questions={questions} />
            </TabsContent>

            <TabsContent value="accordion" className="mt-6">
              <QAAccordion questions={questions} />
            </TabsContent>

            <TabsContent value="flashcards" className="mt-6">
              <Flashcards questions={questions} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
