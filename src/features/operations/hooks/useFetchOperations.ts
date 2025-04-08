
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

  // Simplified fetch operations function with better performance
  const fetchOperations = useCallback(async (force: boolean = false): Promise<void> => {
    console.log('fetchOperations called, force:', force);
    
    // Return early if we're already fetching and this isn't a forced refresh
    if (isLoading && !force) {
      console.log('Already loading and not forced, returning early');
      return;
    }
    
    // Don't fetch if we've fetched recently and this isn't a forced refresh
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;
    if (!force && lastFetchTime > 0 && timeSinceLastFetch < 15000) { // Reduced caching to 15 seconds
      console.log(`Skipping fetch - last fetch was ${timeSinceLastFetch}ms ago`);
      return;
    }
    
    try {
      // Start loading state
      setIsLoading(true);
      setError(null);
      controls.fetchingRef.current = true;
      
      // Get mock data immediately to prevent UI freeze
      const result = await fetchAllOperations();
      
      // Update state with results
      setLastFetchTime(now);
      setOperations(result.allOperations || []);
      
    } catch (error: any) {
      console.error('Error in fetchOperations:', error);
      setError(error.message || 'Une erreur est survenue');
      
      // Try to use mock data as fallback
      try {
        const fallbackData = await fetchAllOperations();
        if (fallbackData && fallbackData.allOperations) {
          setOperations(fallbackData.allOperations);
        }
      } catch (fallbackError) {
        console.error('Error fetching fallback data:', fallbackError);
      }
    } finally {
      setIsLoading(false);
      controls.fetchingRef.current = false;
    }
  }, [
    isLoading, 
    lastFetchTime, 
    fetchAllOperations, 
    controls, 
    setIsLoading, 
    setError, 
    setLastFetchTime
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
    };
  }, [controls]);

  // Initial fetch when component mounts - with a very short delay
  useEffect(() => {
    if (controls.isMountedRef.current) {
      setTimeout(() => {
        if (controls.isMountedRef.current) {
          console.log("Initial fetch when component mounts");
          fetchOperations(true);
        }
      }, 50); // Reduced delay to 50ms
    }
  }, [fetchOperations, controls.isMountedRef]);

  return { operations, isLoading, error, refreshOperations: fetchOperations };
};
