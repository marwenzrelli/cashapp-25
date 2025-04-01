
import { useEffect, useState, useRef } from "react";
import { PublicClientData } from "./types";
import { useFetchClientData } from "./useFetchClientData";
import { useLoadingTimer } from "./useLoadingTimer";
import { useRetryLogic } from "./useRetryLogic";
import { toast } from "sonner";

export const usePublicClientData = (token: string | undefined): PublicClientData => {
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
    disableAutoRetry 
  } = useRetryLogic({
    fetchClientData,
    networkErrorCountRef,
    dataFetchedRef
  });

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
    };
  }, [token, fetchClientData, abortControllerRef]);

  // Handle auto-retry for network errors
  useEffect(() => {
    if (error && !isLoading) {
      // Check if it's a network error
      const isNetworkError = error.includes("network") || 
                           error.includes("connexion") ||
                           error.includes("Failed to fetch") ||
                           error.includes("interrompue");
      
      const timeoutId = attemptAutoRetry(networkErrorCountRef.current, isNetworkError);
      
      // Check if we should disable auto-retry
      disableAutoRetry();
      
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [error, isLoading, attemptAutoRetry, disableAutoRetry, networkErrorCountRef]);
  
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
    fetchClientData,
    retryFetch
  };
};
