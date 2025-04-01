
import { useCallback, useRef } from "react";
import { toast } from "sonner";

interface RetryLogicProps {
  fetchClientData: () => Promise<void>;
  maxRetryAttempts?: number;
  retryDelayMs?: number;
  networkErrorCountRef: React.MutableRefObject<number>;
  dataFetchedRef: React.MutableRefObject<boolean>;
}

/**
 * Hook for handling automatic retry logic
 */
export const useRetryLogic = ({
  fetchClientData,
  maxRetryAttempts = 3,
  retryDelayMs = 2000,
  networkErrorCountRef,
  dataFetchedRef
}: RetryLogicProps) => {
  const autoRetryEnabledRef = useRef(true);
  
  const retryFetch = useCallback(() => {
    console.log("Manually retrying client data fetch");
    dataFetchedRef.current = false; // Reset the data fetched flag to allow a new fetch
    networkErrorCountRef.current = 0;
    autoRetryEnabledRef.current = true;
    
    // Perform the retry
    return fetchClientData();
  }, [fetchClientData, dataFetchedRef, networkErrorCountRef]);

  const attemptAutoRetry = useCallback((attemptCount: number, isNetworkError: boolean) => {
    if (isNetworkError && attemptCount <= maxRetryAttempts && autoRetryEnabledRef.current) {
      console.log(`Auto-retrying in ${retryDelayMs}ms (attempt ${attemptCount}/${maxRetryAttempts})...`);
      // Use progressively longer delays for repeated network errors
      const adjustedDelay = retryDelayMs * (networkErrorCountRef.current > 1 ? 2 : 1);
      
      return setTimeout(() => {
        if (!dataFetchedRef.current && autoRetryEnabledRef.current) {
          fetchClientData();
        }
      }, adjustedDelay);
    }
    
    return null;
  }, [fetchClientData, maxRetryAttempts, retryDelayMs, networkErrorCountRef, dataFetchedRef]);
  
  const disableAutoRetry = useCallback(() => {
    if (networkErrorCountRef.current >= maxRetryAttempts && autoRetryEnabledRef.current) {
      console.log("Maximum auto-retry attempts reached, disabling auto-retry");
      autoRetryEnabledRef.current = false;
      
      // Show toast to inform user
      toast.error("Problème de connexion persistant", {
        description: "Veuillez réessayer manuellement ou revenir plus tard."
      });
      
      // Re-enable after 30 seconds
      setTimeout(() => {
        console.log("Re-enabling auto-retry after cooldown");
        autoRetryEnabledRef.current = true;
        networkErrorCountRef.current = 0;
      }, 30000);
      
      return true;
    }
    return false;
  }, [maxRetryAttempts, networkErrorCountRef]);

  return {
    retryFetch,
    attemptAutoRetry,
    disableAutoRetry,
    autoRetryEnabledRef
  };
};
