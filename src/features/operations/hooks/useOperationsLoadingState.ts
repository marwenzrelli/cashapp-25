
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
      
      fetchOperations(true);
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      // Réduit le temps avant d'afficher le message de timeout à 5 secondes
      loadingTimeoutRef.current = setTimeout(() => {
        if (isLoading) {
          setLoadingTimeout(true);
        }
      }, 5000);
      
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
      }
      
      loadingTimerRef.current = setInterval(() => {
        if (isLoading) {
          const duration = Math.floor((Date.now() - loadingStartTimeRef.current) / 1000);
          setLoadingDuration(duration);
          
          // Affiche l'avertissement réseau après 8 secondes au lieu de 15
          if (duration > 8 && !showNetworkError) {
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

  useEffect(() => {
    if (isLoading && loadingTimeout && initialLoadAttempted && operations.length === 0 && initialFetchAttemptRef.current < 2) {
      initialFetchAttemptRef.current += 1;
      console.log(`Auto-retrying initial fetch, attempt #${initialFetchAttemptRef.current}`);
      
      setLoadingTimeout(false);
      
      // On réessaie automatiquement après un timeout
      fetchOperations(true);
    }
  }, [fetchOperations, isLoading, loadingTimeout, initialLoadAttempted, operations.length]);

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
    
    // Réduit le temps entre les rafraîchissements à 2 secondes
    if (timeSinceLastRefresh < 2000) {
      toast.info(`Attendez ${Math.ceil((2000 - timeSinceLastRefresh) / 1000)} secondes avant de rafraîchir à nouveau`);
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
