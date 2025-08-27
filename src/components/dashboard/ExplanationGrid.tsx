import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Target, Lightbulb, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockExplanations } from '@/data/mockExplanations';

export const ExplanationGrid: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-orange-600" />
          </div>
          AI Generated Explanations
        </h2>
        <Button variant="outline" size="sm" className="gap-2">
          <Target className="h-4 w-4" />
          Generate More
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockExplanations.map((explanation, index) => (
          <motion.div
            key={explanation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-amber-50/70 to-orange-50/70 backdrop-blur-sm shadow-warm">
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
    </motion.div>
  );
};
