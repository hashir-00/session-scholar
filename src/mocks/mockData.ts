import { QuizQuestion } from '@/api/noteService';

/**
 * Mock quiz questions for testing quiz generation
 */
export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is the main concept discussed in these notes?',
    options: [
      'Fundamental theoretical principles',
      'Advanced mathematical equations',
      'Historical timeline events',
      'Scientific methodology'
    ],
    correctAnswer: 'Fundamental theoretical principles',
    explanation: 'The notes focus primarily on foundational concepts that support understanding of the subject matter.'
  },
  {
    id: 'q2',
    question: 'Which approach is emphasized for problem-solving?',
    options: [
      'Memorization techniques',
      'Critical thinking approaches',
      'Random trial methods',
      'Computational algorithms'
    ],
    correctAnswer: 'Critical thinking approaches',
    explanation: 'The notes highlight the importance of analytical thinking in approaching problems systematically.'
  },
  {
    id: 'q3',
    question: 'What connection is made in the material?',
    options: [
      'Theory and practice',
      'Past and future',
      'Simple and complex',
      'Local and global'
    ],
    correctAnswer: 'Theory and practice',
    explanation: 'The material emphasizes connecting theoretical knowledge with practical applications for better understanding.'
  }
];

/**
 * Generate a mock summary for a given filename
 */
export const generateMockSummary = (filename: string): string => {
  return `Here's an AI-generated summary of ${filename}:

This document covers fundamental concepts essential for understanding the subject matter. The content demonstrates a systematic approach to learning with clear progression from basic principles to complex applications.

Key Educational Points:

• Core theoretical concepts that form the foundation of understanding
• Practical examples bridging theory and real-world applications  
• Critical thinking approaches for systematic problem-solving
• Study techniques including active recall and spaced repetition

The material emphasizes connecting theoretical knowledge with practical implementation, making it ideal for comprehensive exam preparation and deeper conceptual understanding. The complexity level is intermediate, requiring foundational knowledge but remaining accessible with proper preparation.`;
};

/**
 * Generate a mock explanation for educational content
 */
export const generateMockExplanation = (): string => {
  return `This document appears to be focused on foundational concepts that are essential for understanding the subject matter. The content demonstrates a systematic approach to learning, with clear progression from basic principles to more complex applications.

**Key Educational Insights:**

1. **Conceptual Framework**: The material follows a logical structure that builds understanding step by step, making it ideal for students who learn best through structured progression.

2. **Practical Applications**: The notes contain real-world examples that help bridge the gap between theoretical knowledge and practical implementation.

3. **Critical Thinking Elements**: Several sections encourage analytical thinking and problem-solving approaches that are valuable for developing deeper understanding.

4. **Study Recommendations**: Based on the content, this material would benefit from active recall techniques and spaced repetition for optimal retention.

The overall complexity level suggests this is intermediate-level material that requires some foundational knowledge but is accessible to students with proper preparation.`;
};
