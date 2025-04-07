
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [fetchAttempts, setFetchAttempts] = useState<number>(0);
  
  const isMountedRef = useRef<boolean>(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchingRef = useRef<boolean>(false);
  const maxRetries = useRef<number>(3);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { fetchAllOperations } = useOperationsFetcher();

  // Fetch operations function with retry logic
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
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      fetchTimeoutRef.current = setTimeout(() => {
        if (fetchingRef.current && isMountedRef.current) {
          console.warn("Fetch operation timeout - resetting loading state");
          fetchingRef.current = false;
          setIsLoading(false);
          
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
          }
        }
      }, 15000); // Increased timeout from 10s to 15s
      
      // Fetch all operations
      const { deposits, withdrawals, transfers } = await fetchAllOperations();
      
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
      
      if (!isMountedRef.current) return;

      console.log(`Raw data - deposits: ${deposits?.length || 0}, withdrawals: ${withdrawals?.length || 0}, transfers: ${transfers?.length || 0}`);

      // Transform the data
      const allOperations = transformToOperations(deposits, withdrawals, transfers);
      
      // Sort operations by date
      const sortedOperations = sortOperationsByDate(allOperations);
      
      console.log(`Fetched ${allOperations.length} operations (${deposits?.length || 0} deposits, ${withdrawals?.length || 0} withdrawals, ${transfers?.length || 0} transfers)`);
      
      // Deduplicate operations
      const uniqueOperations = deduplicateOperations(sortedOperations);
      
      if (!isMountedRef.current) return;
      
      // Format dates for display
      const formattedOperations = uniqueOperations.map(op => {
        const operationDate = op.operation_date || op.date;
        let dateObj;
        
        // Handle various date formats
        if (operationDate) {
          if (typeof operationDate === 'string') {
            dateObj = new Date(operationDate);
          } else if (operationDate instanceof Date) {
            dateObj = operationDate;
          } else {
            // For safety, create a new date
            dateObj = new Date();
          }
        } else {
          dateObj = new Date();
        }
        
        // Format date for French locale
        const formattedDate = dateObj.toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        return {
          ...op,
          formattedDate
        };
      });
      
      setOperations(formattedOperations);
      setError(null);
      
      maxRetries.current = 3;  // Reset max retries on success
    } catch (err: any) {
      if (!isMountedRef.current) return;
      
      console.error('Error fetching operations:', err);
      setError(err.message || 'Erreur inconnue');
      
      // Show toast for first attempt or forced refresh
      if ((force || fetchAttempts <= 1) && isMountedRef.current) {
        toast.error('Erreur lors de la récupération des opérations');
      }
      
      // Retry logic
      if (maxRetries.current > 0 && isMountedRef.current) {
        const retryDelay = calculateRetryDelay(3, maxRetries.current);
        console.log(`Will retry in ${retryDelay}ms, ${maxRetries.current} retries left`);
        maxRetries.current--;
        
        // Schedule retry
        const retryTimer = setTimeout(() => {
          if (isMountedRef.current) {
            fetchOperations(true);
          }
        }, retryDelay);
        
        // Clean up if component unmounts
        return () => clearTimeout(retryTimer);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        fetchingRef.current = false;
        
        if (abortControllerRef.current) {
          abortControllerRef.current = null;
        }
      }
    }
  }, [lastFetchTime, fetchAttempts, fetchAllOperations]);

  // Ensure we clean up on unmount
  useEffect(() => {
    isMountedRef.current = true;
    console.log("useFetchOperations mounted");
    
    return () => {
      console.log("useFetchOperations unmounting");
      isMountedRef.current = false;
      
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // Initial fetch when component mounts
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    // Initiate fetch immediately
    setIsLoading(true);
    fetchOperations(true);
  }, [fetchOperations]);

  return { operations, isLoading, error, refreshOperations: fetchOperations };
};
