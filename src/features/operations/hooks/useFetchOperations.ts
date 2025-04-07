
import { useState, useEffect, useCallback } from 'react';
import { Operation } from '../types';
import { useOperationsFetcher } from './useOperationsFetcher';
import { useFetchStateManager } from './utils/fetchStateManager';
import { fetchOperationsCore } from './utils/fetchOperationsCore';

/**
 * Main hook for fetching operations with state management, error handling, and retry logic
 */
export const useFetchOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const { fetchAllOperations, setUseMocks } = useOperationsFetcher();
  
  const {
    isLoading,
    error,
    lastFetchTime,
    fetchAttempts,
    controls,
    setIsLoading,
    setError,
    setLastFetchTime,
    incrementFetchAttempts
  } = useFetchStateManager();

  // Enable or disable mock data usage
  const setUseMockData = useCallback((useMocks: boolean) => {
    if (setUseMocks) {
      setUseMocks(useMocks);
    }
  }, [setUseMocks]);

  // Fetch operations function with retry logic
  const fetchOperations = useCallback(async (force: boolean = false): Promise<void> => {
    console.log('fetchOperations called, force:', force);
    
    try {
      controls.fetchingRef.current = true;
      
      // Return early if we're already fetching and this isn't a forced refresh
      if (isLoading && !force) {
        console.log('Already loading and not forced, returning early');
        return;
      }
      
      // Don't fetch if we've fetched recently and this isn't a forced refresh
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTime;
      if (!force && lastFetchTime > 0 && timeSinceLastFetch < 30000) {
        console.log(`Skipping fetch - last fetch was ${timeSinceLastFetch}ms ago`);
        return;
      }
      
      // Start loading state
      setIsLoading(true);
      setError(null);
      
      // Use AbortController for this fetch
      if (controls.abortControllerRef.current) {
        controls.abortControllerRef.current.abort();
      }
      controls.abortControllerRef.current = new AbortController();
      
      // Fetch the data
      const result = await fetchAllOperations();
      
      // Update state with results if component is still mounted
      if (controls.isMountedRef.current) {
        setLastFetchTime(now);
        setIsLoading(false);
        setOperations(result.allOperations || []);
      }
    } catch (error: any) {
      console.error('Error in fetchOperations:', error);
      
      if (controls.isMountedRef.current) {
        setError(error.message || 'Une erreur est survenue');
        setIsLoading(false);
      }
      
      if (fetchAttempts < (controls.maxRetries.current || 3)) {
        const retryDelay = Math.min(2000 * (fetchAttempts + 1), 10000);
        console.log(`Scheduling retry ${fetchAttempts + 1} in ${retryDelay}ms`);
        
        setTimeout(() => {
          if (controls.isMountedRef.current) {
            incrementFetchAttempts();
            fetchOperations(true);
          }
        }, retryDelay);
      }
    } finally {
      controls.fetchingRef.current = false;
      
      if (controls.abortControllerRef.current) {
        controls.abortControllerRef.current = null;
      }
    }
  }, [
    isLoading, 
    lastFetchTime, 
    fetchAttempts,
    fetchAllOperations, 
    controls, 
    setIsLoading, 
    setError, 
    setLastFetchTime, 
    incrementFetchAttempts
  ]);

  // Ensure we clean up on unmount
  useEffect(() => {
    controls.isMountedRef.current = true;
    console.log("useFetchOperations mounted");
    
    return () => {
      console.log("useFetchOperations unmounting");
      controls.isMountedRef.current = false;
      
      if (controls.fetchTimeoutRef.current) {
        clearTimeout(controls.fetchTimeoutRef.current);
        controls.fetchTimeoutRef.current = null;
      }
      
      if (controls.abortControllerRef.current) {
        controls.abortControllerRef.current.abort();
        controls.abortControllerRef.current = null;
      }
    };
  }, [controls]);

  // Initial fetch when component mounts
  useEffect(() => {
    if (controls.isMountedRef.current) {
      // Initiate fetch immediately
      console.log("Initial fetch when component mounts");
      setIsLoading(true);
      fetchOperations(true);
    }
  }, [fetchOperations, setIsLoading, controls.isMountedRef]);

  return { 
    operations, 
    isLoading, 
    error, 
    refreshOperations: fetchOperations,
    setUseMockData
  };
};
