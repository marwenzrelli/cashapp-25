
import { useState, useEffect, useRef } from "react";
import { Operation } from "../types";
import { toast } from "sonner";

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

  useEffect(() => {
    if (!initialLoadAttempted) {
      console.log("Initial operations fetch");
      setInitialLoadAttempted(true);
      lastRefreshTimeRef.current = Date.now();
      loadingStartTimeRef.current = Date.now();
      
      // Initial fetch of operations with force=true
      fetchOperations(true);
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      // Reduced timeout to 3 seconds
      loadingTimeoutRef.current = setTimeout(() => {
        if (isLoading) {
          setLoadingTimeout(true);
        }
      }, 3000);
      
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
      }
      
      loadingTimerRef.current = setInterval(() => {
        if (isLoading) {
          const duration = Math.floor((Date.now() - loadingStartTimeRef.current) / 1000);
          setLoadingDuration(duration);
          
          // Show network warning after 5 seconds
          if (duration > 5 && !showNetworkError) {
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

  // Auto-retry logic
  useEffect(() => {
    if (isLoading && loadingTimeout && initialLoadAttempted && operations.length === 0 && initialFetchAttemptRef.current < 2) {
      initialFetchAttemptRef.current += 1;
      console.log(`Auto-retrying initial fetch, attempt #${initialFetchAttemptRef.current}`);
      
      setLoadingTimeout(false);
      fetchOperations(true);
    }
  }, [fetchOperations, isLoading, loadingTimeout, initialLoadAttempted, operations.length]);

  // Reset states when loading state changes
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
      
      if (forcedRefresh) {
        setForcedRefresh(false);
      }
    }
  }, [isLoading, forcedRefresh]);

  const handleManualRefresh = () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
    
    // Reduce time between refreshes to 1 second
    if (timeSinceLastRefresh < 1000) {
      toast.info(`Attendez ${Math.ceil((1000 - timeSinceLastRefresh) / 1000)} secondes avant de rafraîchir à nouveau`);
      return;
    }
    
    console.log("Manual refresh triggered");
    manualRefreshClickedRef.current = true;
    lastRefreshTimeRef.current = now;
    setLoadingTimeout(false);
    setShowNetworkError(false);
    fetchOperations(true);
  };

  const handleForceRefresh = () => {
    console.log("Force refresh triggered");
    manualRefreshClickedRef.current = true;
    lastRefreshTimeRef.current = Date.now();
    setLoadingTimeout(false);
    setShowNetworkError(false);
    setForcedRefresh(true);
    
    fetchOperations(true);
  };

  // Calculated display states
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
