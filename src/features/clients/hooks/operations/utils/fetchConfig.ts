
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
 */
export const withTimeout = <T>(promise: Promise<T>, timeout = FETCH_CONFIG.TIMEOUT): Promise<T> => {
  return Promise.race([
    promise,
    createTimeoutPromise(timeout)
  ]) as Promise<T>;
};
