
import { useEffect, useState, useRef } from "react";
import { PublicClientData } from "./types";
import { useFetchClientData } from "./useFetchClientData";
import { useLoadingTimer } from "./useLoadingTimer";
import { useRetryLogic } from "./useRetryLogic";
import { toast } from "sonner";
import { isOnline } from "@/utils/network";

export const usePublicClientData = (token: string | undefined): PublicClientData => {
  // Track connection status
  const [isConnected, setIsConnected] = useState(isOnline);
  
  // Get core data fetching functionality
  const {
    client,
    operations,
    isLoading,
    error,
    loadingTime: fetchLoadingTime,
    fetchingRef,
    dataFetchedRef,
    networkErrorCountRef,
    abortControllerRef,
    fetchClientData,
    setLoadingTime
  } = useFetchClientData(token);

  // Get loading timer functionality
  const { loadingTime } = useLoadingTimer(isLoading, error);

  // Keep loadingTime in sync between hooks
  useEffect(() => {
    setLoadingTime(loadingTime);
  }, [loadingTime, setLoadingTime]);

  // Get retry logic functionality
  const { 
    retryFetch, 
    attemptAutoRetry, 
    disableAutoRetry,
    cleanupRetry
  } = useRetryLogic({
    fetchClientData,
    networkErrorCountRef,
    dataFetchedRef,
    maxRetryAttempts: 4
  });

  // Track online status
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      const online = isOnline();
      setIsConnected(online);
      
      if (online && error) {
        console.log("Internet connection restored, auto-retry enabled");
        // Small delay to ensure connection is stable
        setTimeout(() => {
          if (error) {
            toast.info("Connexion internet rétablie", {
              description: "Nouvelle tentative en cours..."
            });
            retryFetch();
          }
        }, 1500);
      }
    };
    
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    // Initial check
    handleOnlineStatusChange();
    
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
      cleanupRetry();
    };
  }, [error, retryFetch, cleanupRetry]);

  // Initial fetch on mount or token change - only run once
  const initialLoadCompletedRef = useRef(false);
  useEffect(() => {
    if (token && !initialLoadCompletedRef.current) {
      console.log("Initial data load with token:", token);
      fetchClientData();
      initialLoadCompletedRef.current = true;
    }
    
    return () => {
      // Clean up any pending requests on unmount
      if (abortControllerRef.current) {
        console.log("Cleaning up - aborting any pending requests");
        abortControllerRef.current.abort("component unmounted");
        abortControllerRef.current = null;
      }
      
      // Clean up any retry timers
      cleanupRetry();
    };
  }, [token, fetchClientData, abortControllerRef, cleanupRetry]);

  // Handle auto-retry for network errors
  useEffect(() => {
    if (error && !isLoading) {
      // Check if it's a network error
      const isNetworkError = error.includes("network") || 
                           error.includes("connexion") ||
                           error.includes("Failed to fetch") ||
                           error.includes("interrompue") ||
                           error.includes("réseau");
      
      if (isNetworkError && isConnected) {
        console.log("Network error detected but device appears online - will retry");
      }
      
      const timeoutId = attemptAutoRetry(networkErrorCountRef.current, isNetworkError);
      
      // Check if we should disable auto-retry
      disableAutoRetry();
      
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [error, isLoading, attemptAutoRetry, disableAutoRetry, networkErrorCountRef, isConnected]);
  
  // Show success toast when data is loaded
  const errorNotifiedRef = useRef(false);
  useEffect(() => {
    if (client && operations && !error && !isLoading) {
      toast.success("Données client chargées", {
        description: `${operations.length} opérations trouvées pour ${client.prenom} ${client.nom}`
      });
    }
    
    // Reset error notification ref when error or loading state changes
    if (!error || isLoading) {
      errorNotifiedRef.current = false;
    }
  }, [client, operations, isLoading, error]);

  return {
    client,
    operations: operations || [],
    isLoading,
    error,
    loadingTime,
    isConnected,
    fetchClientData,
    retryFetch
  };
};
