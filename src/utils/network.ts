
/**
 * Utilities for network status and connection handling
 */

/**
 * Check if the browser is currently online
 */
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.onLine !== false;
};

/**
 * Detect if an error is network related
 */
export const isNetworkError = (error: Error | string): boolean => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    errorMessage.includes('network') ||
    errorMessage.includes('connexion') ||
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('interrompue') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('abort') ||
    errorMessage.includes('réseau') ||
    errorMessage.includes("délai d'attente") ||
    errorMessage.includes('offline')
  );
};

/**
 * Wait for network to be available
 * @returns Promise that resolves when network is available
 */
export const waitForNetwork = (timeout = 10000): Promise<boolean> => {
  return new Promise(resolve => {
    // If already online, resolve immediately
    if (isOnline()) {
      resolve(true);
      return;
    }
    
    // Set a timeout to avoid waiting forever
    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', onOnline);
      resolve(false);
    }, timeout);
    
    // Listen for online event
    const onOnline = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', onOnline);
      // Small delay to ensure connection is stable
      setTimeout(() => resolve(true), 1000);
    };
    
    window.addEventListener('online', onOnline);
  });
};
