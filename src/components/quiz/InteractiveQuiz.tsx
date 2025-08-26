import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuizQuestion } from '@/api/noteService';

interface InteractiveQuizProps {
  questions: QuizQuestion[];
}

interface QuizState {
  [questionId: string]: {
    selectedAnswer: string | null;
    showResult: boolean;
  };
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ questions }) => {
  const [quizState, setQuizState] = useState<QuizState>({});

  const handleAnswerSelect = (questionId: string, selectedAnswer: string) => {
    setQuizState(prev => ({
      ...prev,
      [questionId]: {
        selectedAnswer,
        showResult: true
      }
    }));
  };

  const resetQuestion = (questionId: string) => {
    setQuizState(prev => ({
      ...prev,
      [questionId]: {
        selectedAnswer: null,
        showResult: false
      }
    }));
  };

  const getOptionStyle = (
    questionId: string,
    option: string,
    correctAnswer: string,
    isSelected: boolean,
    showResult: boolean
  ) => {
    if (!showResult) {
      return isSelected
        ? 'bg-amber-100 border-amber-300 text-amber-800'
        : 'bg-card hover:bg-amber-50 border-amber-200/50 hover:border-amber-300';
    }

    if (option === correctAnswer) {
      return 'bg-green-100 border-green-300 text-green-800';
    }

    if (isSelected && option !== correctAnswer) {
      return 'bg-red-100 border-red-300 text-red-800';
    }

    return 'bg-gray-100 border-gray-200 text-gray-600';
  };

  const getOptionIcon = (
    option: string,
    correctAnswer: string,
    selectedAnswer: string | null,
    showResult: boolean
  ) => {
    if (!showResult) return null;

    if (option === correctAnswer) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }

    if (selectedAnswer === option && option !== correctAnswer) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
          <HelpCircle className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-amber-900">Interactive Quiz</h3>
          <p className="text-sm text-amber-700">Test your knowledge with immediate feedback</p>
        </div>
      </div>

      {questions.map((question, index) => {
        const state = quizState[question.id] || { selectedAnswer: null, showResult: false };
        const isCorrect = state.selectedAnswer === question.correctAnswer;

        return (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50/70 to-orange-50/70">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h4 className="font-semibold text-amber-900 mb-4">
                    {index + 1}. {question.question}
                  </h4>
                  
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <motion.button
                        key={optionIndex}
                        onClick={() => !state.showResult && handleAnswerSelect(question.id, option)}
                        disabled={state.showResult}
                        className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left flex items-center justify-between ${getOptionStyle(
                          question.id,
                          option,
                          question.correctAnswer,
                          state.selectedAnswer === option,
                          state.showResult
                        )}`}
                        whileHover={!state.showResult ? { scale: 1.02 } : {}}
                        whileTap={!state.showResult ? { scale: 0.98 } : {}}
                      >
                        <span className="font-medium">{option}</span>
                        {getOptionIcon(option, question.correctAnswer, state.selectedAnswer, state.showResult)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {state.showResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 space-y-3"
                  >
                    <div className={`p-4 rounded-lg border ${
                      isCorrect 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className={`font-semibold ${
                          isCorrect ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {isCorrect ? 'Correct!' : 'Incorrect'}
                        </span>
                      </div>
                      {question.explanation && (
                        <p className={`text-sm ${
                          isCorrect ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {question.explanation}
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={() => resetQuestion(question.id)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Try Again
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
