
/**
 * Configuration constants for fetch operations
 */
export const FETCH_CONFIG = {
  MAX_RETRIES: 1,
  RETRY_DELAY: 1000,
  TIMEOUT: 5000
};

/**
 * Creates a timeout promise that rejects after the specified time
 */
export const createTimeoutPromise = (timeout = FETCH_CONFIG.TIMEOUT) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), timeout);
  });
};

/**
 * Wraps a promise with a timeout to prevent hanging requests
 * Modified to properly handle Supabase query objects
 */
export const withTimeout = async <T>(query: any, timeout = FETCH_CONFIG.TIMEOUT): Promise<T> => {
  try {
    // Create a promise that resolves when the query completes or rejects on timeout
    const result = await Promise.race([
      query,
      createTimeoutPromise(timeout)
    ]);
    return result as T;
  } catch (error) {
    if (error instanceof Error && error.message === "Request timeout") {
      throw new Error("Database request timed out. Please try again.");
    }
    throw error;
  }
};
