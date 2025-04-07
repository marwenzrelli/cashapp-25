
import { useState, useEffect, useRef } from "react";
import { Operation } from "../types";

interface UseOperationsLoadingStateProps {
  isLoading: boolean;
  error: string | null;
  operations: Operation[];
  fetchOperations: (force: boolean) => void;
}

export const useOperationsLoadingState = ({
  isLoading,
  error,
  operations,
  fetchOperations
}: UseOperationsLoadingStateProps) => {
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [loadingDuration, setLoadingDuration] = useState(0);
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [forcedRefresh, setForcedRefresh] = useState(false);
  
  const lastRefreshTimeRef = useRef<number>(Date.now());
  const manualRefreshClickedRef = useRef<boolean>(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loadingStartTimeRef = useRef<number>(0);
  const initialFetchAttemptRef = useRef<number>(0);

  // Fetch operations on initial load
  useEffect(() => {
    if (!initialLoadAttempted) {
      console.log("Initial operations fetch");
      setInitialLoadAttempted(true);
      lastRefreshTimeRef.current = Date.now();
      loadingStartTimeRef.current = Date.now();
      
      // Attempt the initial fetch
      fetchOperations(true);
      
      // Set a loading timeout to detect stalled loading
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      loadingTimeoutRef.current = setTimeout(() => {
        if (isLoading) {
          setLoadingTimeout(true);
        }
      }, 7000);
      
      // Start a timer to show how long we've been loading
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
      }
      
      loadingTimerRef.current = setInterval(() => {
        if (isLoading) {
          const duration = Math.floor((Date.now() - loadingStartTimeRef.current) / 1000);
          setLoadingDuration(duration);
          
          // After 15 seconds of loading, show network error suggestion
          if (duration > 15 && !showNetworkError) {
            setShowNetworkError(true);
          }
        }
      }, 1000);
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
      }
    };
  }, [fetchOperations, initialLoadAttempted, isLoading, showNetworkError]);

  // Auto-retry initial load if still loading after timeout
  useEffect(() => {
    if (isLoading && loadingTimeout && initialLoadAttempted && operations.length === 0 && initialFetchAttemptRef.current < 2) {
      // Auto-retry the fetch, but only twice
      initialFetchAttemptRef.current += 1;
      console.log(`Auto-retrying initial fetch, attempt #${initialFetchAttemptRef.current}`);
      
      // Reset loading timeout 
      setLoadingTimeout(false);
      
      // Force a fresh fetch
      fetchOperations(true);
    }
  }, [fetchOperations, isLoading, loadingTimeout, initialLoadAttempted, operations.length]);

  // Reset loading timer when loading state changes
  useEffect(() => {
    if (isLoading) {
      if (!loadingStartTimeRef.current) {
        loadingStartTimeRef.current = Date.now();
      }
    } else {
      loadingStartTimeRef.current = 0;
      setLoadingDuration(0);
      setShowNetworkError(false);
      
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      
      // Reset forced refresh state when loading completes
      if (forcedRefresh) {
        setForcedRefresh(false);
      }
    }
  }, [isLoading, forcedRefresh]);

  // Handle manual refresh with throttling
  const handleManualRefresh = () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
    
    // Limit manual refreshes to one every 3 seconds
    if (timeSinceLastRefresh < 3000) {
      toast.info(`Attendez ${Math.ceil((3000 - timeSinceLastRefresh) / 1000)} secondes avant de rafraîchir à nouveau`);
      return;
    }
    
    console.log("Manual refresh triggered");
    manualRefreshClickedRef.current = true;
    lastRefreshTimeRef.current = now;
    setLoadingTimeout(false);
    setShowNetworkError(false);
    fetchOperations(true);
  };

  // Function for forced refresh in case of timeout
  const handleForceRefresh = () => {
    console.log("Force refresh triggered");
    manualRefreshClickedRef.current = true;
    lastRefreshTimeRef.current = Date.now();
    setLoadingTimeout(false);
    setShowNetworkError(false);
    setForcedRefresh(true);
    
    // Force discard previous request state
    fetchOperations(true);
  };

  // Determine if we should show loading, error, or content
  const showInitialLoading = isLoading && operations.length === 0 && !loadingTimeout;
  const showLoadingTimeout = loadingTimeout && operations.length === 0;
  const showError = !isLoading && error && operations.length === 0 && initialLoadAttempted && !loadingTimeout;
  const showEmptyState = !isLoading && !error && operations.length === 0 && initialLoadAttempted && !loadingTimeout;
  const showContent = operations.length > 0 || (isLoading && operations.length > 0);

  return {
    loadingDuration,
    loadingTimeout,
    showNetworkError,
    showInitialLoading,
    showLoadingTimeout,
    showError,
    showEmptyState,
    showContent,
    handleForceRefresh,
    handleManualRefresh
  };
};
