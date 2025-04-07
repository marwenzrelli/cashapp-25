
import { toast } from 'sonner';
import { FetchControls } from './fetchStateManager';

/**
 * Creates and manages a fetch timeout
 */
export const setupFetchTimeout = (
  controls: FetchControls, 
  setIsLoading: (isLoading: boolean) => void,
  timeoutMs: number = 15000
): void => {
  const { fetchTimeoutRef, fetchingRef, isMountedRef, abortControllerRef } = controls;
  
  // Clear any existing timeout
  if (fetchTimeoutRef.current) {
    clearTimeout(fetchTimeoutRef.current);
  }
  
  // Set a new timeout
  fetchTimeoutRef.current = setTimeout(() => {
    if (fetchingRef.current && isMountedRef.current) {
      console.warn("Fetch operation timeout - resetting loading state");
      fetchingRef.current = false;
      setIsLoading(false);
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
  }, timeoutMs);
};

/**
 * Cleans up fetch timeout
 */
export const clearFetchTimeout = (fetchTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>): void => {
  if (fetchTimeoutRef.current) {
    clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = null;
  }
};
