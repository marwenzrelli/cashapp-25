
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
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loadingStartTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!initialLoadAttempted) {
      setInitialLoadAttempted(true);
      lastRefreshTimeRef.current = Date.now();
      loadingStartTimeRef.current = Date.now();
      
      // Initial fetch of operations with force=true
      fetchOperations(true);
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      // Reduced timeout to 2 seconds
      loadingTimeoutRef.current = setTimeout(() => {
        if (isLoading) {
          setLoadingTimeout(true);
        }
      }, 2000);
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
      }
    };
  }, [fetchOperations, initialLoadAttempted, isLoading]);

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
    // Allow immediate refresh
    console.log("Manual refresh triggered");
    lastRefreshTimeRef.current = Date.now();
    setLoadingTimeout(false);
    setShowNetworkError(false);
    fetchOperations(true);
  };

  const handleForceRefresh = () => {
    console.log("Force refresh triggered");
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
