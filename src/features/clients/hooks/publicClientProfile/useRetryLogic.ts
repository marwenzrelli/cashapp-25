
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { isOnline, waitForNetwork } from "@/utils/network";

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
  maxRetryAttempts = 5, // Increased from 3
  retryDelayMs = 2000,
  networkErrorCountRef,
  dataFetchedRef
}: RetryLogicProps) => {
  const autoRetryEnabledRef = useRef(true);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const retryFetch = useCallback(async () => {
    console.log("Manually retrying client data fetch");
    
    // Clear any previous retry timer
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    
    dataFetchedRef.current = false; // Reset the data fetched flag to allow a new fetch
    networkErrorCountRef.current = 0;
    autoRetryEnabledRef.current = true;
    
    // Check if we're online before attempting fetch
    if (!isOnline()) {
      toast.info("Connexion réseau indisponible", {
        description: "En attente de reconnexion..."
      });
      
      // Wait for network before retrying
      const networkRestored = await waitForNetwork();
      if (!networkRestored) {
        toast.error("Impossible de récupérer une connexion internet", {
          description: "Veuillez vérifier votre connexion réseau et réessayer."
        });
        return;
      }
      
      toast.success("Connexion internet rétablie", {
        description: "Tentative de récupération des données..."
      });
    }
    
    // Perform the retry
    return fetchClientData();
  }, [fetchClientData, dataFetchedRef, networkErrorCountRef]);

  const attemptAutoRetry = useCallback((attemptCount: number, isNetworkError: boolean) => {
    // Clear any existing retry timer
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    
    if (isNetworkError && attemptCount <= maxRetryAttempts && autoRetryEnabledRef.current) {
      // Use progressively longer delays for repeated network errors
      const backoffFactor = Math.min(attemptCount, 4); // Cap to avoid extremely long delays
      const adjustedDelay = retryDelayMs * Math.pow(1.5, backoffFactor);
      
      console.log(`Auto-retrying in ${adjustedDelay}ms (attempt ${attemptCount}/${maxRetryAttempts})...`);
      
      retryTimerRef.current = setTimeout(async () => {
        retryTimerRef.current = null;
        
        // Only retry if we're online and auto-retry is still enabled
        if (!dataFetchedRef.current && autoRetryEnabledRef.current) {
          if (!isOnline()) {
            console.log("Auto-retry postponed: device is offline");
            toast.info("En attente de connexion internet", {
              description: "La tentative sera effectuée dès que possible"
            });
            
            // Wait for network to be restored
            const networkRestored = await waitForNetwork(30000);
            if (networkRestored && autoRetryEnabledRef.current) {
              console.log("Network restored, continuing with retry");
              fetchClientData();
            }
          } else {
            fetchClientData();
          }
        }
      }, adjustedDelay);
      
      return retryTimerRef.current;
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
      
      // Re-enable after 45 seconds (increased from 30)
      setTimeout(() => {
        console.log("Re-enabling auto-retry after cooldown");
        autoRetryEnabledRef.current = true;
        networkErrorCountRef.current = 0;
      }, 45000);
      
      return true;
    }
    return false;
  }, [maxRetryAttempts, networkErrorCountRef]);

  const cleanupRetry = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  return {
    retryFetch,
    attemptAutoRetry,
    disableAutoRetry,
    cleanupRetry,
    autoRetryEnabledRef
  };
};
