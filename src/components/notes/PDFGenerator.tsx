import { Note } from '@/api/noteService';

interface PDFGeneratorProps {
  note: Note;
}

interface Concept {
  title?: string;
  name?: string;
  explanation?: string;
  description?: string;
}

interface StructuredExplanation {
  concepts?: Concept[];
  summary?: string;
  learningTips?: string[];
  studyTips?: string[];
  learningApproaches?: string[];
  explanations?: Array<{concept: string; explanation: string}>;
  [key: string]: unknown;
}

interface QuizQuestion {
  question: string;
  options?: string[];
  correctAnswer?: number | string;
  explanation?: string;
}

export const generatePDFContent = ({ note }: PDFGeneratorProps): string => {
  // Generate tags list
  const tags = [];
  if (note.summary) tags.push('Summary Ready');
  if (note.explanation) tags.push('Explanation Ready');  
  if (note.quiz) tags.push('Quiz Ready');

  // Format explanation content
  const formatExplanation = (explanation: string | StructuredExplanation | unknown): string => {
    if (typeof explanation === 'string') {
      return `
        <div class="explanation-container">
          <div class="explanation-header">
            <div class="explanation-icon">🧠</div>
            <h4>AI Learning Analysis</h4>
          </div>
          <div class="explanation-content">${explanation}</div>
        </div>
      `;
    }
    
    // If explanation is structured (object), format it nicely
    if (explanation && typeof explanation === 'object') {
      const structuredExplanation = explanation as StructuredExplanation;
      let formatted = '';
      
      // Key Concepts Section - Handle both 'concepts' and 'explanations' arrays
      if ((structuredExplanation.concepts && Array.isArray(structuredExplanation.concepts)) ||
          (structuredExplanation.explanations && Array.isArray(structuredExplanation.explanations))) {
        formatted += `
          <div class="explanation-container">
            <div class="explanation-header">
              <div class="explanation-icon">🧠</div>
              <h4>Key Concepts</h4>
            </div>
            <div class="concepts-grid">
        `;
        
        // Handle 'explanations' array (from ExplanationRenderer)
        if (structuredExplanation.explanations && Array.isArray(structuredExplanation.explanations)) {
          structuredExplanation.explanations.forEach((item, index) => {
            formatted += `
              <div class="concept-item">
                <h5>${item.concept}</h5>
                <p>${item.explanation}</p>
              </div>
            `;
          });
        }
        // Handle 'concepts' array (legacy format)
        else if (structuredExplanation.concepts && Array.isArray(structuredExplanation.concepts)) {
          structuredExplanation.concepts.forEach((concept: Concept, index: number) => {
            formatted += `
              <div class="concept-item">
                <h5>${concept.title || concept.name || `Concept ${index + 1}`}</h5>
                <p>${concept.explanation || concept.description || ''}</p>
              </div>
            `;
          });
        }
        
        formatted += `
            </div>
          </div>
        `;
      }
      
      // Learning Approaches and Study Tips Grid
      if ((structuredExplanation.learningTips && Array.isArray(structuredExplanation.learningTips)) || 
          structuredExplanation.studyTips || structuredExplanation.learningApproaches) {
        formatted += `<div class="tips-grid">`;
        
        // Learning Approaches
        if (structuredExplanation.learningApproaches && Array.isArray(structuredExplanation.learningApproaches)) {
          formatted += `
            <div class="learning-approaches">
              <h5>🧠 Learning Approaches</h5>
              <ul>
          `;
          structuredExplanation.learningApproaches.forEach((approach: string) => {
            formatted += `<li>• ${approach}</li>`;
          });
          formatted += `</ul></div>`;
        }
        
        // Study Tips
        const tips = structuredExplanation.learningTips || structuredExplanation.studyTips;
        if (tips && Array.isArray(tips)) {
          formatted += `
            <div class="study-tips">
              <h5>✅ Study Tips</h5>
              <ul>
          `;
          tips.forEach((tip: string) => {
            formatted += `<li>• ${tip}</li>`;
          });
          formatted += `</ul></div>`;
        }
        
        formatted += `</div>`;
      }
      
      // If none of the above, just stringify it
      if (!formatted) {
        formatted = `
          <div class="explanation-container">
            <div class="explanation-header">
              <div class="explanation-icon">🧠</div>
              <h4>AI Learning Analysis</h4>
            </div>
            <div class="explanation-content">${JSON.stringify(explanation, null, 2)}</div>
          </div>
        `;
      }
      
      return formatted;
    }
    
    return `
      <div class="explanation-container">
        <div class="explanation-header">
          <div class="explanation-icon">🧠</div>
          <h4>AI Learning Analysis</h4>
        </div>
        <div class="explanation-content">No explanation available</div>
      </div>
    `;
  };

  // Format quiz content
  const formatQuiz = (quiz: QuizQuestion[]): string => {
    if (!quiz || !Array.isArray(quiz) || quiz.length === 0) {
      return '<div class="no-content">No quiz available</div>';
    }

    let formatted = '<div class="quiz-container">';
    quiz.forEach((question, index) => {
      formatted += `
        <div class="quiz-question">
          <div class="question-header">
            <span class="question-number">Q${index + 1}</span>
            <h4>${question.question}</h4>
          </div>
      `;
      
      if (question.options && Array.isArray(question.options)) {
        formatted += `<div class="quiz-options">`;
        question.options.forEach((option: string, optIndex: number) => {
          const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
          const isCorrect = question.correctAnswer === optIndex || question.correctAnswer === option;
          formatted += `
            <div class="quiz-option ${isCorrect ? 'correct-option' : ''}">
              <span class="option-letter">${letter}</span>
              <span class="option-text">${option}</span>
              ${isCorrect ? '<span class="correct-indicator">✓</span>' : ''}
            </div>
          `;
        });
        formatted += `</div>`;
      }
      
      if (question.explanation) {
        formatted += `
          <div class="question-explanation">
            <strong>💡 Explanation:</strong> ${question.explanation}
          </div>
        `;
      }
      
      formatted += `</div>`;
    });
    formatted += `</div>`;

    return formatted;
  };

  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${note.filename}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          line-height: 1.6;
          color: #333;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid #f59e0b;
          padding-bottom: 20px;
        }
        .title { 
          font-size: 24px; 
          font-weight: bold; 
          color: #d97706;
          margin-bottom: 10px;
        }
        .tags { 
          margin: 10px 0; 
        }
        .tag { 
          display: inline-block;
          background: #fef3c7; 
          border: 1px solid #f59e0b;
          padding: 4px 8px; 
          margin: 2px; 
          border-radius: 4px; 
          font-size: 12px;
        }
        .status { 
          background: #dcfce7; 
          border: 1px solid #16a34a;
          color: #15803d;
        }
        .image-container { 
          text-align: center; 
          margin: 30px 0; 
        }
        .image { 
          max-width: 100%; 
          max-height: 400px; 
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        .content-section { 
          margin: 30px 0; 
          page-break-inside: avoid;
        }
        .section-title { 
          font-size: 18px; 
          font-weight: bold; 
          color: #374151;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e5e7eb;
        }
        .summary-content { 
          background: #f9fafb; 
          padding: 15px; 
          border-radius: 8px;
          white-space: pre-line;
        }
        
        /* Explanation Styles - Matching ExplanationRenderer */
        .explanation-container {
          background: linear-gradient(to right, #faf5ff, #eff6ff);
          border: 1px solid #c4b5fd;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 15px;
        }
        .explanation-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .explanation-icon {
          width: 24px;
          height: 24px;
          background: linear-gradient(to right, #a855f7, #3b82f6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: white;
        }
        .explanation-header h4 {
          font-weight: 600;
          color: #111827;
          margin: 0;
          font-size: 16px;
        }
        .explanation-content {
          color: #374151;
          line-height: 1.5;
          white-space: pre-line;
          font-size: 14px;
        }
        .concepts-grid {
          display: grid;
          gap: 8px;
        }
        .concept-item {
          border-left: 2px solid #c4b5fd;
          padding-left: 12px;
          margin-bottom: 8px;
        }
        .concept-item h5 {
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
          font-size: 14px;
        }
        .concept-item p {
          color: #374151;
          line-height: 1.4;
          margin: 0;
          font-size: 13px;
        }
        .tips-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 15px;
        }
        .learning-approaches {
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 6px;
          padding: 12px;
        }
        .learning-approaches h5 {
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .learning-approaches ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .learning-approaches li {
          color: #1d4ed8;
          margin-bottom: 4px;
          font-size: 13px;
        }
        .study-tips {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 6px;
          padding: 12px;
        }
        .study-tips h5 {
          font-weight: 600;
          color: #166534;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .study-tips ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .study-tips li {
          color: #15803d;
          margin-bottom: 4px;
          font-size: 13px;
        }
        
        /* Quiz Styles - MCQ Format */
        .quiz-container {
          background: #fefbff;
          border-radius: 12px;
          padding: 20px;
        }
        .quiz-question {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .question-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }
        .question-number {
          background: linear-gradient(to right, #a855f7, #7c3aed);
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 12px;
          min-width: 32px;
          text-align: center;
        }
        .question-header h4 {
          color: #7c3aed;
          font-weight: 600;
          margin: 0;
          flex: 1;
        }
        .quiz-options {
          display: grid;
          gap: 8px;
          margin: 16px 0;
        }
        .quiz-option {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .quiz-option.correct-option {
          background: #dcfce7;
          border-color: #16a34a;
          font-weight: 600;
        }
        .option-letter {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: #f3f4f6;
          border-radius: 50%;
          font-weight: 600;
          font-size: 12px;
          margin-right: 12px;
          flex-shrink: 0;
        }
        .correct-option .option-letter {
          background: #16a34a;
          color: white;
        }
        .option-text {
          flex: 1;
        }
        .correct-indicator {
          color: #16a34a;
          font-weight: bold;
          margin-left: 8px;
        }
        .question-explanation {
          margin-top: 16px;
          padding: 12px 16px;
          background: #fffbeb;
          border-radius: 6px;
          border-left: 4px solid #f59e0b;
          font-style: italic;
          color: #92400e;
        }
        .no-content {
          text-align: center;
          color: #6b7280;
          font-style: italic;
          padding: 40px;
        }
        @media print {
          body { margin: 0; }
          .header { page-break-after: avoid; }
          .content-section { page-break-before: auto; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${note.filename}</div>
        <div class="tags">
          <span class="tag status">Status: ${note.status}</span>
          ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
      
      ${note.originalImageUrl ? `
        <div class="image-container">
          <img src="${note.originalImageUrl}" alt="${note.filename}" class="image" />
        </div>
      ` : ''}
      
      ${note.summary ? `
        <div class="content-section">
          <div class="section-title">📋 AI Summary</div>
          <div class="summary-content">${note.summary}</div>
        </div>
      ` : ''}
      
      ${note.explanation ? `
        <div class="content-section">
          <div class="section-title">💡 AI Explanation & Learning Insights</div>
          <div class="summary-content">${formatExplanation(note.explanation)}</div>
        </div>
      ` : ''}
      
      ${note.quiz && note.quiz.length > 0 ? `
        <div class="content-section">
          <div class="section-title">🧠 Study Quiz</div>
          <div class="summary-content">${formatQuiz(note.quiz)}</div>
        </div>
      ` : ''}
    </body>
    </html>
  `;

  return htmlContent;
};

export const downloadPDF = async (note: Note): Promise<void> => {
  try {
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    if (!printWindow) {
      alert('Please allow pop-ups for this site to download the PDF');
      return;
    }

    const htmlContent = generatePDFContent({ note });

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content and images to load
    printWindow.addEventListener('load', () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        
        // Optional: Close the window after printing (uncomment if desired)
        // setTimeout(() => {
        //   printWindow.close();
        // }, 1000);
      }, 1000);
    });

    // Fallback if the load event doesn't fire
    setTimeout(() => {
      if (printWindow && !printWindow.closed) {
        printWindow.focus();
        printWindow.print();
      }
    }, 2000);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};
