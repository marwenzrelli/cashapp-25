
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
    await fetchOperationsCore({
      fetchAllOperations,
      state: { isLoading, error, lastFetchTime, fetchAttempts },
      controls,
      setIsLoading,
      setError,
      setLastFetchTime,
      incrementFetchAttempts,
      setOperations,
      force
    });
  }, [
    fetchAllOperations, 
    isLoading,
    error, 
    lastFetchTime, 
    fetchAttempts, 
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
    if (!controls.isMountedRef.current) return;
    
    // Initiate fetch immediately
    setIsLoading(true);
    fetchOperations(true);
  }, [fetchOperations, setIsLoading, controls.isMountedRef]);

  return { operations, isLoading, error, refreshOperations: fetchOperations };
};
