
import { useState, useEffect, useCallback, useRef } from 'react';
import { Operation } from '../types';
import { toast } from 'sonner';
import { useOperationsFetcher } from './useOperationsFetcher';
import { 
  transformToOperations, 
  deduplicateOperations, 
  sortOperationsByDate 
} from './utils/operationTransformers';
import { calculateRetryDelay, shouldRetry } from './utils/retryLogic';

/**
 * Main hook for fetching operations with state management, error handling, and retry logic
 */
export const useFetchOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [fetchAttempts, setFetchAttempts] = useState<number>(0);
  
  const isMountedRef = useRef<boolean>(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchingRef = useRef<boolean>(false);
  const maxRetries = useRef<number>(3);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { fetchAllOperations } = useOperationsFetcher();

  const fetchOperations = useCallback(async (force: boolean = false) => {
    // Skip if already fetching and not forced
    if (fetchingRef.current && !force) {
      console.log("Une requête est déjà en cours, ignorant cette requête");
      return;
    }
    
    // Rate limiting to prevent excessive fetching
    const now = Date.now();
    if (!force && now - lastFetchTime < 2000) {
      console.log(`Dernier fetch il y a ${now - lastFetchTime}ms, ignorant cette requête`);
      return;
    }
    
    try {
      if (!isMountedRef.current) return;
      
      // Cancel any in-progress requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      fetchingRef.current = true;
      setIsLoading(true);
      setLastFetchTime(now);
      setFetchAttempts(prev => prev + 1);
      
      console.log("Fetching operations, attempt #", fetchAttempts + 1);
      
      // Set a timeout to prevent fetching from hanging indefinitely
      const loadingTimeout = setTimeout(() => {
        if (fetchingRef.current && isMountedRef.current) {
          console.warn("Fetch operation timeout - resetting loading state");
          fetchingRef.current = false;
          setIsLoading(false);
          
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
          }
        }
      }, 10000);
      
      // Fetch all operations
      const { deposits, withdrawals, transfers } = await fetchAllOperations();
      
      clearTimeout(loadingTimeout);
      
      if (!isMountedRef.current) return;

      console.log("Raw deposits data:", deposits);
      console.log("Raw withdrawals data:", withdrawals);
      console.log("Raw transfers data:", transfers);

      // Transform the data
      const allOperations = transformToOperations(deposits, withdrawals, transfers);
      
      // Sort operations by date
      const sortedOperations = sortOperationsByDate(allOperations);
      
      console.log(`Fetched ${allOperations.length} operations (${deposits.length || 0} deposits, ${withdrawals.length || 0} withdrawals, ${transfers.length || 0} transfers)`);
      
      // Deduplicate operations
      const uniqueOperations = deduplicateOperations(sortedOperations);
      
      if (!isMountedRef.current) return;
      
      setOperations(uniqueOperations);
      setError(null);
      
      maxRetries.current = 3;  // Reset max retries on success
    } catch (err: any) {
      console.error('Error fetching operations:', err);
      setError(err.message);
      
      // Show toast for first attempt or forced refresh
      if (force || fetchAttempts <= 1) {
        toast.error('Erreur lors de la récupération des opérations');
      }
      
      // Retry logic
      if (maxRetries.current > 0) {
        const retryDelay = calculateRetryDelay(3, maxRetries.current);
        console.log(`Will retry in ${retryDelay}ms, ${maxRetries.current} retries left`);
        maxRetries.current--;
        
        // Schedule retry
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchOperations(true);
          }
        }, retryDelay);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        fetchingRef.current = false;
        
        abortControllerRef.current = null;
      }
    }
  }, [lastFetchTime, fetchAttempts, fetchAllOperations]);

  // Initial fetch when component mounts
  useEffect(() => {
    isMountedRef.current = true;
    
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    fetchTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setIsLoading(true);
        fetchOperations(true);
      }
    }, 100);
    
    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchOperations]);

  return { operations, isLoading, error, refreshOperations: fetchOperations };
};
