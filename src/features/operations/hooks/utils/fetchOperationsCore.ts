
import { toast } from 'sonner';
import { Operation } from '../../types';
import { FetchControls, FetchState } from './fetchStateManager';
import { setupFetchTimeout, clearFetchTimeout } from './fetchTimeoutHandler';
import { formatOperationsWithDates } from './operationFormatter';
import { 
  transformToOperations, 
  deduplicateOperations, 
  sortOperationsByDate 
} from './operationTransformers';
import { calculateRetryDelay } from './retryLogic';

type FetchOperationsParams = {
  fetchAllOperations: () => Promise<{
    deposits: any[];
    withdrawals: any[];
    transfers: any[];
  }>;
  state: FetchState;
  controls: FetchControls;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setLastFetchTime: (time: number) => void;
  incrementFetchAttempts: () => void;
  setOperations: (operations: Operation[]) => void;
  force?: boolean;
};

/**
 * Core function to fetch operations with retry logic
 */
export const fetchOperationsCore = async ({
  fetchAllOperations,
  state,
  controls,
  setIsLoading,
  setError,
  setLastFetchTime,
  incrementFetchAttempts,
  setOperations,
  force = false
}: FetchOperationsParams): Promise<void> => {
  const { lastFetchTime, fetchAttempts } = state;
  const { isMountedRef, fetchingRef, maxRetries, abortControllerRef } = controls;
  
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
    incrementFetchAttempts();
    
    console.log("Fetching operations, attempt #", fetchAttempts + 1);
    
    // Set a timeout to prevent fetching from hanging indefinitely
    setupFetchTimeout(controls, setIsLoading);
    
    // Fetch all operations
    const { deposits, withdrawals, transfers } = await fetchAllOperations();
    
    clearFetchTimeout(controls.fetchTimeoutRef);
    
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
    const formattedOperations = formatOperationsWithDates(uniqueOperations);
    
    setOperations(formattedOperations);
    setError(null);
    
    maxRetries.current = 3;  // Reset max retries on success
  } catch (err: unknown) {
    if (!isMountedRef.current) return;
    
    console.error('Error fetching operations:', err);
    
    // Handle different error types
    let errorMessage = 'Erreur inconnue';
    if (err && typeof err === 'object' && 'message' in err) {
      errorMessage = String(err.message);
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    
    setError(errorMessage);
    
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
          fetchOperationsCore({
            fetchAllOperations,
            state: { ...state, fetchAttempts: fetchAttempts + 1 },
            controls,
            setIsLoading,
            setError,
            setLastFetchTime,
            incrementFetchAttempts,
            setOperations,
            force: true
          });
        }
      }, retryDelay);
      
      // Clean up if component unmounts
      if (!isMountedRef.current) {
        clearTimeout(retryTimer);
      }
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
};
