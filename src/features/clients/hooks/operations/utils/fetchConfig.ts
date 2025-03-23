
/**
 * Configuration constants for fetch operations
 */
export const FETCH_CONFIG = {
  MAX_RETRIES: 1,
  RETRY_DELAY: 1000,
  TIMEOUT: 8000 // Increased timeout to give more time for operations
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
    if (result && typeof result === 'object') {
      // Make sure data and error properties exist, even if null
      return {
        data: 'data' in result ? result.data : null,
        error: 'error' in result ? result.error : null,
        ...result
      } as SupabaseQueryResult<T>;
    }
    
    // Handle unexpected result structure - safely transform it
    return { data: null, error: new Error("Invalid response format") };
  } catch (error) {
    if (error instanceof Error && error.message === "Request timeout") {
      return { data: null, error: new Error("Database request timed out. Please try again.") };
    }
    return { data: null, error };
  }
};
