import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { QuizQuestion } from '@/api/noteService';

interface QAAccordionProps {
  questions: QuizQuestion[];
}

export const QAAccordion: React.FC<QAAccordionProps> = ({ questions }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-emerald-900">Quick Q&A</h3>
          <p className="text-sm text-emerald-700">Click to reveal answers instantly</p>
        </div>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50/70 to-green-50/70">
        <CardContent className="p-6">
          <Accordion type="multiple" className="space-y-2">
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AccordionItem 
                  value={question.id} 
                  className="border-0 bg-white/80 rounded-lg px-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4 group">
                    <div className="flex items-start gap-3 w-full">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-emerald-700">Q</span>
                      </div>
                      <span className="font-medium text-emerald-900 text-sm leading-relaxed">
                        {question.question}
                      </span>
                    </div>
                                  </AccordionTrigger>
                  
                  <AccordionContent className="pb-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="ml-9 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-green-700">A</span>
                        </div>
                        <div className="space-y-2">
                          <p className="font-semibold text-green-800 text-sm">
                            {question.correctAnswer}
                          </p>
                          {question.explanation && (
                            <div className="p-3 bg-green-50 rounded-md border border-green-200">
                              <p className="text-sm text-green-700 leading-relaxed">
                                <span className="font-medium">Explanation: </span>
                                {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {question.options && question.options.length > 1 && (
                        <div className="ml-9 mt-3">
                          <p className="text-xs font-medium text-emerald-600 mb-2">Other options considered:</p>
                          <div className="flex flex-wrap gap-2">
                            {question.options
                              .filter(option => option !== question.correctAnswer)
                              .map((option, optionIndex) => (
                                <span
                                  key={optionIndex}
                                  className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs"
                                >
                                  {option}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
