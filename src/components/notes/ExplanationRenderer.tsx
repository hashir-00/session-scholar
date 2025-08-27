import React from 'react';
import { Brain, CheckCircle } from 'lucide-react';
import { ConceptExplanationResponse } from '@/api/noteService';

interface ExplanationRendererProps {
  explanation: string | ConceptExplanationResponse;
}

export const ExplanationRenderer: React.FC<ExplanationRendererProps> = ({ explanation }) => {
  // Handle string explanation (legacy or mock)
  if (typeof explanation === 'string') {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">AI Learning Analysis</h4>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {explanation}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle structured explanation from API
  const structuredExplanation = explanation as ConceptExplanationResponse;
  
  return (
    <div className="space-y-6">
      {/* Key Concepts Section */}
      {structuredExplanation.explanations && structuredExplanation.explanations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-4">Key Concepts</h4>
              <div className="space-y-4">
                {structuredExplanation.explanations.map((item, index) => (
                  <div key={index} className="border-l-2 border-purple-300 pl-4">
                    <h5 className="font-medium text-gray-900 mb-2">{item.concept}</h5>
                    <p className="text-sm text-gray-700 leading-relaxed">{item.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Learning Approaches and Study Tips Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Learning Approaches */}
        {structuredExplanation.learningApproaches && structuredExplanation.learningApproaches.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4" />
             Learning Approaches
            </h5>
            <ul className="text-sm text-blue-700 space-y-2">
              {structuredExplanation.learningApproaches.map((approach, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{approach}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Study Tips */}
        {structuredExplanation.studyTips && structuredExplanation.studyTips.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-medium text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Study Tips
            </h5>
            <ul className="text-sm text-green-700 space-y-2">
              {structuredExplanation.studyTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
