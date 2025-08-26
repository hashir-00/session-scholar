import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuizQuestion } from '@/api/noteService';

interface FlashcardsProps {
  questions: QuizQuestion[];
}

export const Flashcards: React.FC<FlashcardsProps> = ({ questions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const currentQuestion = questions[currentIndex];

  const nextCard = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  const prevCard = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + questions.length) % questions.length);
  };

  const flipCard = () => {
    setFlipped(!flipped);
  };

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
          <Lightbulb className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-purple-900">Flashcards</h3>
          <p className="text-sm text-purple-700">Click to flip and reveal answers</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-purple-600 font-medium">
          Card {currentIndex + 1} of {questions.length}
        </span>
        <div className="flex gap-2">
          <Button
            onClick={prevCard}
            variant="outline"
            size="sm"
            disabled={questions.length <= 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={nextCard}
            variant="outline"
            size="sm"
            disabled={questions.length <= 1}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative w-full h-80 perspective-1000">
        <motion.div
          onClick={flipCard}
          className="relative w-full h-full cursor-pointer preserve-3d"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
        >
          {/* Front side - Question */}
          <Card className="absolute inset-0 backface-hidden border-0 shadow-xl bg-gradient-to-br from-purple-50/90 to-indigo-50/90 hover:shadow-2xl transition-shadow">
            <CardContent className="p-8 h-full flex flex-col justify-center items-center text-center">
              <div className="mb-4">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-purple-600">Q</span>
                </div>
                <h4 className="text-xl font-semibold text-purple-900 leading-relaxed">
                  {currentQuestion.question}
                </h4>
              </div>
              
              <div className="mt-auto">
                <div className="flex items-center gap-2 text-purple-600 text-sm">
                  <RotateCcw className="h-4 w-4" />
                  <span>Click to reveal answer</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back side - Answer */}
          <Card className="absolute inset-0 backface-hidden rotate-y-180 border-0 shadow-xl bg-gradient-to-br from-indigo-50/90 to-blue-50/90 hover:shadow-2xl transition-shadow">
            <CardContent className="p-8 h-full flex flex-col justify-center items-center text-center">
              <div className="mb-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-indigo-600">A</span>
                </div>
                <h4 className="text-xl font-semibold text-indigo-900 mb-4">
                  {currentQuestion.correctAnswer}
                </h4>
                
                {currentQuestion.explanation && (
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 max-w-md">
                    <p className="text-sm text-indigo-700 leading-relaxed">
                      <span className="font-medium">Explanation: </span>
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-auto">
                <div className="flex items-center gap-2 text-indigo-600 text-sm">
                  <RotateCcw className="h-4 w-4" />
                  <span>Click to see question</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex justify-center">
        <div className="flex gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setFlipped(false);
              }}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-purple-600'
                  : 'bg-purple-200 hover:bg-purple-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
