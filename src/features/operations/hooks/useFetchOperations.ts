
import { useState, useEffect, useCallback } from 'react';
import { Operation } from '../types';
import { useOperationsFetcher } from './useOperationsFetcher';
import { useFetchStateManager } from './utils/fetchStateManager';

/**
 * Simplified hook for fetching operations with better performance
 */
export const useFetchOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const { fetchAllOperations } = useOperationsFetcher();
  
  const {
    isLoading,
    error,
    lastFetchTime,
    controls,
    setIsLoading,
    setError,
    setLastFetchTime
  } = useFetchStateManager();

  // Simplified fetch operations function - no delays, no complex logic
  const fetchOperations = useCallback(async (force: boolean = false): Promise<void> => {
    // Return early if we're already fetching and this isn't a forced refresh
    if (isLoading && !force) return;
    
    try {
      // Start loading state
      setIsLoading(true);
      setError(null);
      
      // Get mock data immediately without delays
      const result = await fetchAllOperations();
      
      // Update state with results
      setLastFetchTime(Date.now());
      setOperations(result.allOperations || []);
    } catch (error: any) {
      console.error('Error in fetchOperations:', error);
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, fetchAllOperations, setIsLoading, setError, setLastFetchTime]);

  // Initial fetch when component mounts - with no delay
  useEffect(() => {
    fetchOperations(true);
  }, [fetchOperations]);

  return { operations, isLoading, error, refreshOperations: fetchOperations };
};
