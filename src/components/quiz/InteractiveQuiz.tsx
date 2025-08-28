import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle, ChevronLeft, ChevronRight, RotateCcw, Trophy, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BackendMCQQuestion } from '@/api/noteService';

interface InteractiveQuizProps {
  questions: BackendMCQQuestion[];
}

interface QuizAnswer {
  questionIndex: number;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  question: string;
  explanation?: string;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const correctAnswer = currentQuestion?.answers.find(answer => answer.correct)?.answer || '';
  const isCorrect = selectedAnswer === correctAnswer;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const score = answers.filter(answer => answer.isCorrect).length;

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
  };

  const handleNext = () => {
    if (selectedAnswer && currentQuestion) {
      // Save the answer
      const answerData: QuizAnswer = {
        questionIndex: currentQuestionIndex,
        selectedAnswer,
        correctAnswer,
        isCorrect,
        question: currentQuestion.question,
        explanation: currentQuestion.explanation
      };
      
      setAnswers(prev => [...prev, answerData]);
    }

    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz is complete
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      
      // Load previous answer if exists
      const previousAnswer = answers[currentQuestionIndex - 1];
      if (previousAnswer) {
        setSelectedAnswer(previousAnswer.selectedAnswer);
        setShowResult(true);
        // Remove this answer from the array since we're going back
        setAnswers(prev => prev.slice(0, -1));
      } else {
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsComplete(false);
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) {
      return {
        cardBg: 'from-green-50/70 to-emerald-50/70',
        headerBg: 'from-green-50/90 to-emerald-50/90',
        borderColor: 'border-green-200/50',
        iconBg: 'from-green-600 to-emerald-600',
        titleColor: 'text-green-900',
        reviewHeaderBg: 'from-green-50/95 to-emerald-50/95',
        reviewBorderColor: 'border-green-200/30',
        buttonBg: 'from-green-50/90 to-emerald-50/90',
        buttonBorderColor: 'border-green-200/50'
      };
    } else if (accuracy >= 40) {
      return {
        cardBg: 'from-yellow-50/70 to-amber-50/70',
        headerBg: 'from-yellow-50/90 to-amber-50/90',
        borderColor: 'border-yellow-200/50',
        iconBg: 'from-yellow-600 to-amber-600',
        titleColor: 'text-yellow-900',
        reviewHeaderBg: 'from-yellow-50/95 to-amber-50/95',
        reviewBorderColor: 'border-yellow-200/30',
        buttonBg: 'from-yellow-50/90 to-amber-50/90',
        buttonBorderColor: 'border-yellow-200/50'
      };
    } else {
      return {
        cardBg: 'from-red-50/70 to-rose-50/70',
        headerBg: 'from-red-50/90 to-rose-50/90',
        borderColor: 'border-red-200/50',
        iconBg: 'from-red-600 to-rose-600',
        titleColor: 'text-red-900',
        reviewHeaderBg: 'from-red-50/95 to-rose-50/95',
        reviewBorderColor: 'border-red-200/30',
        buttonBg: 'from-red-50/90 to-rose-50/90',
        buttonBorderColor: 'border-red-200/50'
      };
    }
  };

  const getOptionStyle = (option: string) => {
    if (!showResult) {
      return selectedAnswer === option
        ? 'bg-amber-100 border-amber-300 text-amber-800'
        : 'bg-card hover:bg-amber-50 border-amber-200/50 hover:border-amber-300 cursor-pointer';
    }

    if (option === correctAnswer) {
      return 'bg-green-100 border-green-300 text-green-800';
    }

    if (selectedAnswer === option && option !== correctAnswer) {
      return 'bg-red-100 border-red-300 text-red-800';
    }

    return 'bg-gray-100 border-gray-200 text-gray-600';
  };

  const getOptionIcon = (option: string) => {
    if (!showResult) return null;

    if (option === correctAnswer) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }

    if (selectedAnswer === option && option !== correctAnswer) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }

    return null;
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <HelpCircle className="h-12 w-12 mx-auto mb-4" />
        <p>No quiz questions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 ">
      {/* Mobile Header - Score and Progress on Top */}
      <div className="block sm:hidden space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
              <HelpCircle className="h-3 w-3 text-white" />
            </div>
            <h3 className="text-sm font-bold text-amber-900">Interactive Quiz Flow</h3>
          </div>
          <Badge variant="outline" className="bg-amber-50 text-xs">
            <Target className="h-3 w-3 mr-1" />
            Score: {score}/{answers.length}
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      {/* Desktop Header - Original Layout */}
      <div className="hidden sm:flex items-center gap-2 mb-3 mt-1">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
          <HelpCircle className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 m-1">
          <h3 className="text-lg font-bold text-amber-900">Interactive Quiz Flow</h3>
          <p className="text-xs text-amber-700">Answer questions one by one with immediate feedback</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-amber-50 text-xs">
            <Target className="h-3 w-3 mr-1" />
            Score: {score}/{answers.length}
          </Badge>
        </div>
      </div>

      {/* Desktop Progress Bar */}
      <div className="hidden sm:block space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Quiz Content Area with Fixed Height and Scroll */}
      <div className="h-[480px] overflow-hidden">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Card className="h-full overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50/70 to-orange-50/70">
                <CardContent className="p-4 h-full flex flex-col">
                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center pb-3 border-b mb-4">
                    <Button
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none mr-2"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      <span className="hidden xs:inline">Previous</span>
                      <span className="xs:hidden">Prev</span>
                    </Button>

                  

                    <Button
                      onClick={handleNext}
                      disabled={!showResult}
                      size="sm"
                      className="flex-1 sm:flex-none ml-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                    >
                      {currentQuestionIndex === questions.length - 1 ? (
                        <>
                          <span className="hidden xs:inline">Finish Quiz</span>
                          <span className="xs:hidden">Finish</span>
                          <Trophy className="h-4 w-4 ml-1" />
                        </>
                      ) : (
                        <>
                          <span className="hidden xs:inline">Next</span>
                          <span className="xs:hidden">Next</span>
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <div className="mb-4">
                      <h4 className="font-semibold text-amber-900 mb-3 text-base">
                        {currentQuestion.question}
                      </h4>
                      
                      <div className="space-y-2">
                        {currentQuestion.answers.map((answer, optionIndex) => (
                          <motion.button
                            key={optionIndex}
                            onClick={() => handleAnswerSelect(answer.answer)}
                            disabled={showResult}
                            className={`w-full p-3 rounded-lg border-2 transition-all duration-300 text-left flex items-center justify-between ${getOptionStyle(answer.answer)}`}
                            whileHover={!showResult ? { scale: 1.02 } : {}}
                            whileTap={!showResult ? { scale: 0.98 } : {}}
                          >
                            <span className="font-medium text-sm">{answer.answer}</span>
                            {getOptionIcon(answer.answer)}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {showResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                      >
                        <div className={`p-3 rounded-lg border ${
                          isCorrect 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {isCorrect ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`font-semibold text-sm ${
                              isCorrect ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {isCorrect ? 'Correct!' : 'Incorrect'}
                            </span>
                          </div>
                          {currentQuestion.explanation && (
                            <p className={`text-xs ${
                              isCorrect ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {currentQuestion.explanation}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* Quiz Results Summary */
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="h-full flex flex-col"
            >
              {(() => {
                const accuracy = Math.round((score / questions.length) * 100);
                const colors = getAccuracyColor(accuracy);
                
                return (
                  <Card className={`h-full overflow-hidden border-0 shadow-lg bg-gradient-to-br ${colors.cardBg} flex flex-col`}>
                    {/* Sticky Header */}
                    <CardHeader className={`text-center pb-3 bg-gradient-to-br ${colors.headerBg} backdrop-blur-sm border-b ${colors.borderColor} sticky top-0 z-10`}>
                      <div className={`h-12 w-12 bg-gradient-to-r ${colors.iconBg} rounded-full flex items-center justify-center mx-auto mb-3`}>
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className={`text-xl ${colors.titleColor}`}>Quiz Complete!</CardTitle>
                      <div className="flex items-center justify-center gap-3 mt-3">
                        <Badge variant="outline" className={`${
                          accuracy >= 70 ? 'bg-green-100 text-green-800' :
                          accuracy >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        } px-3 py-1`}>
                          Final Score: {score}/{questions.length}
                        </Badge>
                        <Badge variant="outline" className={`${
                          accuracy >= 70 ? 'bg-green-100 text-green-800' :
                          accuracy >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        } text-sm`}>
                          {accuracy}% Accuracy
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    {/* Scrollable Content */}
                    <CardContent className="flex-1 overflow-y-auto px-4">
                      <div className="space-y-3">
                        <h4 className={`font-semibold ${colors.titleColor} mb-3 text-base sticky top-0 bg-gradient-to-br ${colors.reviewHeaderBg} backdrop-blur-sm py-2 -mx-4 px-4 border-b ${colors.reviewBorderColor}`}>
                          Review Your Answers:
                        </h4>
                        
                        {answers.map((answer, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg border ${
                              answer.isCorrect 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <div className="flex items-start gap-3 mb-2">
                              {answer.isCorrect ? (
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-sm mb-2">
                                  Q{index + 1}: {answer.question}
                                </p>
                                <p className={`text-sm ${
                                  answer.isCorrect ? 'text-green-700' : 'text-red-700'
                                }`}>
                                  Your answer: {answer.selectedAnswer}
                                </p>
                                {!answer.isCorrect && (
                                  <p className="text-sm text-green-700">
                                    Correct answer: {answer.correctAnswer}
                                  </p>
                                )}
                                {answer.explanation && (
                                  <p className="text-sm text-gray-600 mt-2 italic">
                                    {answer.explanation}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                    
                    {/* Fixed Bottom Button */}
                    <div className={`p-4 border-t ${colors.buttonBorderColor} bg-gradient-to-br ${colors.buttonBg} backdrop-blur-sm`}>
                      <div className="flex justify-center">
                        <Button
                          onClick={handleRestart}
                          variant="outline"
                          className="gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Take Quiz Again
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
