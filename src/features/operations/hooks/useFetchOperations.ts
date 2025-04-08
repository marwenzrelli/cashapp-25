
import { useState, useEffect, useCallback } from 'react';
import { Operation } from '../types';
import { useOperationsFetcher } from './useOperationsFetcher';
import { useFetchStateManager } from './utils/fetchStateManager';

/**
 * Main hook for fetching operations with state management, error handling, and retry logic
 */
export const useFetchOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const { fetchAllOperations } = useOperationsFetcher();
  
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
      
      // Simplified fetch with shorter timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch timeout')), 5000);
      });
      
      // Race between actual fetch and timeout
      const fetchPromise = fetchAllOperations();
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      
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
        
        // Attempt to use fallback data
        try {
          const fallbackData = await fetchAllOperations();
          if (fallbackData && fallbackData.allOperations) {
            setOperations(fallbackData.allOperations);
          }
        } catch (fallbackError) {
          console.error('Error fetching fallback data:', fallbackError);
        }
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
      // Short timeout to allow component to mount fully
      setTimeout(() => {
        if (controls.isMountedRef.current) {
          console.log("Initial fetch when component mounts");
          setIsLoading(true);
          fetchOperations(true);
        }
      }, 100);
    }
  }, [fetchOperations, setIsLoading, controls.isMountedRef]);

  return { operations, isLoading, error, refreshOperations: fetchOperations };
};
