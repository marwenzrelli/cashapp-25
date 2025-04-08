
import { useState, useEffect, useCallback } from 'react';
import { Operation } from '../types';
import { useOperationsFetcher } from './useOperationsFetcher';
import { useFetchStateManager } from './utils/fetchStateManager';

/**
 * Ultra-simplified hook for fetching operations with maximum performance
 */
export const useFetchOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const { fetchAllOperations } = useOperationsFetcher();
  
  const {
    isLoading,
    error,
    lastFetchTime,
    setIsLoading,
    setError,
    setLastFetchTime
  } = useFetchStateManager();

  // Super simplified fetch operations function - no delays, no complex logic
  const fetchOperations = useCallback(async (force: boolean = false): Promise<void> => {
    // Don't re-fetch if already loading, unless forced
    if (isLoading && !force) return;
    
    try {
      // Start loading state
      setIsLoading(true);
      setError(null);
      
      // Get mock data immediately - use sync function for better performance
      const result = fetchAllOperations();
      
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

  // Initial fetch when component mounts - with minimal delay
  useEffect(() => {
    // Use a minimal setTimeout to allow component to render first
    const timer = setTimeout(() => {
      fetchOperations(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, [fetchOperations]);

  return { operations, isLoading, error, refreshOperations: fetchOperations };
};
