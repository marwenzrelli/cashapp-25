
/**
 * Calculates the delay for retrying operations based on attempt count
 */
export const calculateRetryDelay = (maxRetries: number, currentAttempt: number): number => {
  // Exponential backoff with a cap
  const retryDelay = Math.min(2000 * Math.pow(2, maxRetries - currentAttempt), 10000);
  return retryDelay;
};

/**
 * Determines if another retry should be attempted
 */
export const shouldRetry = (
  forceRetry: boolean, 
  fetchAttempts: number,
  maxRetries: number
): boolean => {
  return forceRetry || fetchAttempts <= 1 || maxRetries > 0;
};
