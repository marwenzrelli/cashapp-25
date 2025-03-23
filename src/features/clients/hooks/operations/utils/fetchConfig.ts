
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
 * Type definition for Supabase query result
 */
export interface SupabaseQueryResult<T> {
  data: T | null;
  error: any | null;
  [key: string]: any;
}

/**
 * Wraps a promise with a timeout to prevent hanging requests
 * Properly handles Supabase query objects and preserves their structure
 */
export const withTimeout = async <T>(query: any, timeout = FETCH_CONFIG.TIMEOUT): Promise<SupabaseQueryResult<T>> => {
  try {
    // Create a promise that resolves when the query completes or rejects on timeout
    const result = await Promise.race([
      query,
      createTimeoutPromise(timeout)
    ]);
    
    // Ensure the result has the expected structure
    if (result && typeof result === 'object' && ('data' in result || 'error' in result)) {
      return result as SupabaseQueryResult<T>;
    }
    
    // Handle unexpected result structure
    return { data: result as T, error: null };
  } catch (error) {
    if (error instanceof Error && error.message === "Request timeout") {
      throw new Error("Database request timed out. Please try again.");
    }
    throw error;
  }
};
