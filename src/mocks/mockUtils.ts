/**
 * Mock API utilities for simulating network delays and responses
 */

/**
 * Simulate an API delay
 */
export const simulateApiDelay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Simulate API success response
 */
export const simulateApiSuccess = <T>(data: T, delay: number = 0): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay);
  });
};

/**
 * Simulate API error response
 */
export const simulateApiError = (message: string, delay: number = 0): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
};

/**
 * Simulate random API failure (useful for testing error handling)
 */
export const simulateRandomFailure = <T>(
  successData: T, 
  failureRate: number = 0.1, 
  delay: number = 0
): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < failureRate) {
        reject(new Error('Random API failure'));
      } else {
        resolve(successData);
      }
    }, delay);
  });
};
