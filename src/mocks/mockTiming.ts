/**
 * Mock API response delays and timing configurations
 */
export const mockTiming = {
  upload: {
    delay: 1000, // 1 second upload simulation
    processingMin: 3000, // Minimum 3 seconds for processing
    processingMax: 5000, // Maximum 5 seconds for processing
  },
  quiz: {
    initialDelay: 500, // Initial delay before starting generation
    generationMin: 3000, // Minimum 3 seconds for quiz generation
    generationMax: 4000, // Maximum 4 seconds for quiz generation
  },
  explanation: {
    initialDelay: 500, // Initial delay before starting generation
    generationMin: 2000, // Minimum 2 seconds for explanation generation
    generationMax: 3000, // Maximum 3 seconds for explanation generation
  },
  api: {
    getNotes: 300, // Delay for getNotes API call
    getNote: 200, // Delay for getNote API call
    deleteNote: 300, // Delay for deleteNote API call
  }
};

/**
 * Generate a random delay within the specified range
 */
export const getRandomDelay = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};
