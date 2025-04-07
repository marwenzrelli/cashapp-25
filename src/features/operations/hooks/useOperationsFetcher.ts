
import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatOperationsWithDates } from './utils/operationFormatter';
import { transformToOperations, deduplicateOperations, sortOperationsByDate } from './utils/operationTransformers';
import { mockDeposits, mockWithdrawals, mockTransfers } from '../data/mock-operations';

interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Hook that provides functions to fetch operations data from Supabase
 */
export const useOperationsFetcher = () => {
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const shouldUseMocksRef = useRef<boolean>(false);
  
  /**
   * Creates and registers a new AbortController
   */
  const createAbortController = useCallback((operationType: string) => {
    // Cancel any existing controller for this operation type
    if (abortControllersRef.current.has(operationType)) {
      const existingController = abortControllersRef.current.get(operationType);
      if (existingController) {
        existingController.abort();
      }
    }
    
    // Create a new controller
    const controller = new AbortController();
    abortControllersRef.current.set(operationType, controller);
    return controller;
  }, []);
  
  /**
   * Remove abort controller from tracking
   */
  const removeAbortController = useCallback((operationType: string) => {
    abortControllersRef.current.delete(operationType);
  }, []);
  
  /**
   * Enable or disable using mock data as fallback
   */
  const setUseMocks = useCallback((useMocks: boolean) => {
    shouldUseMocksRef.current = useMocks;
    if (useMocks) {
      console.log('Using mock operations data as fallback');
    }
  }, []);
  
  /**
   * Fetches deposits from Supabase or mocks if enabled
   */
  const fetchDeposits = useCallback(async () => {
    console.log('Fetching deposits...');
    const controller = createAbortController('deposits');
    
    try {
      if (shouldUseMocksRef.current) {
        console.log('Using mock deposits data');
        return mockDeposits;
      }
      
      // Extended timeout to 60s to handle slow connections
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch deposits timeout')), 60000);
      });
      
      // Create the database query promise
      const queryPromise = supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Use Promise.race with proper typing
      const result = await Promise.race([
        queryPromise.then(res => res as unknown as SupabaseResponse<any[]>),
        timeoutPromise
      ]);
      
      if (result && 'data' in result) {
        if (result.error) {
          console.error('Error fetching deposits:', result.error);
          toast.error('Erreur lors de la récupération des versements');
          
          if (shouldUseMocksRef.current) {
            console.log('Falling back to mock deposits');
            return mockDeposits;
          }
          return [];
        }
        
        console.log(`Fetched ${result.data?.length || 0} deposits`);
        return result.data || [];
      }
      
      if (shouldUseMocksRef.current) {
        console.log('Falling back to mock deposits after timeout');
        return mockDeposits;
      }
      return [];
    } catch (error) {
      console.error('Error in fetchDeposits:', error);
      
      if (shouldUseMocksRef.current) {
        console.log('Falling back to mock deposits after error');
        return mockDeposits;
      }
      // Return empty array on error to avoid breaking the UI
      return [];
    } finally {
      removeAbortController('deposits');
    }
  }, [createAbortController, removeAbortController]);

  /**
   * Fetches withdrawals from Supabase or mocks if enabled
   */
  const fetchWithdrawals = useCallback(async () => {
    console.log('Fetching withdrawals...');
    const controller = createAbortController('withdrawals');
    
    try {
      if (shouldUseMocksRef.current) {
        console.log('Using mock withdrawals data');
        return mockWithdrawals;
      }
      
      // Extended timeout to 60s to handle slow connections
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch withdrawals timeout')), 60000);
      });
      
      // Create the database query promise
      const queryPromise = supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Use Promise.race with proper typing
      const result = await Promise.race([
        queryPromise.then(res => res as unknown as SupabaseResponse<any[]>),
        timeoutPromise
      ]);
      
      if (result && 'data' in result) {
        if (result.error) {
          console.error('Error fetching withdrawals:', result.error);
          toast.error('Erreur lors de la récupération des retraits');
          
          if (shouldUseMocksRef.current) {
            console.log('Falling back to mock withdrawals');
            return mockWithdrawals;
          }
          return [];
        }
        
        console.log(`Fetched ${result.data?.length || 0} withdrawals`);
        return result.data || [];
      }
      
      if (shouldUseMocksRef.current) {
        console.log('Falling back to mock withdrawals after timeout');
        return mockWithdrawals;
      }
      return [];
    } catch (error) {
      console.error('Error in fetchWithdrawals:', error);
      
      if (shouldUseMocksRef.current) {
        console.log('Falling back to mock withdrawals after error');
        return mockWithdrawals;
      }
      // Return empty array on error to avoid breaking the UI
      return [];
    } finally {
      removeAbortController('withdrawals');
    }
  }, [createAbortController, removeAbortController]);

  /**
   * Fetches transfers from Supabase or mocks if enabled
   */
  const fetchTransfers = useCallback(async () => {
    console.log('Fetching transfers...');
    const controller = createAbortController('transfers');
    
    try {
      if (shouldUseMocksRef.current) {
        console.log('Using mock transfers data');
        return mockTransfers;
      }
      
      // Extended timeout to 60s to handle slow connections
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch transfers timeout')), 60000);
      });
      
      // Create the database query promise
      const queryPromise = supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Use Promise.race with proper typing
      const result = await Promise.race([
        queryPromise.then(res => res as unknown as SupabaseResponse<any[]>),
        timeoutPromise
      ]);
      
      if (result && 'data' in result) {
        if (result.error) {
          console.error('Error fetching transfers:', result.error);
          toast.error('Erreur lors de la récupération des virements');
          
          if (shouldUseMocksRef.current) {
            console.log('Falling back to mock transfers');
            return mockTransfers;
          }
          return [];
        }
        
        console.log(`Fetched ${result.data?.length || 0} transfers`);
        return result.data || [];
      }
      
      if (shouldUseMocksRef.current) {
        console.log('Falling back to mock transfers after timeout');
        return mockTransfers;
      }
      return [];
    } catch (error) {
      console.error('Error in fetchTransfers:', error);
      
      if (shouldUseMocksRef.current) {
        console.log('Falling back to mock transfers after error');
        return mockTransfers;
      }
      return [];
    } finally {
      removeAbortController('transfers');
    }
  }, [createAbortController, removeAbortController]);

  /**
   * Fetches all operation types concurrently
   */
  const fetchAllOperations = useCallback(async () => {
    try {
      console.log('Starting fetchAllOperations...');
      
      // Extended timeout to 90s
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch operations timeout')), 90000);
      });
      
      const fetchPromise = Promise.all([
        fetchDeposits().catch(err => {
          console.error('Error in fetchDeposits promise:', err);
          return shouldUseMocksRef.current ? mockDeposits : [];
        }),
        fetchWithdrawals().catch(err => {
          console.error('Error in fetchWithdrawals promise:', err);
          return shouldUseMocksRef.current ? mockWithdrawals : [];
        }),
        fetchTransfers().catch(err => {
          console.error('Error in fetchTransfers promise:', err);
          return shouldUseMocksRef.current ? mockTransfers : [];
        })
      ]);
      
      // Race the fetch against the timeout
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Type guard to ensure we have the fetchPromise result
      if (Array.isArray(result) && result.length === 3) {
        const [deposits, withdrawals, transfers] = result;
        
        console.log(`fetchAllOperations completed with ${deposits.length} deposits, ${withdrawals.length} withdrawals, ${transfers.length} transfers`);
        
        // Transform raw data into unified Operation objects
        const allOperations = transformToOperations(deposits, withdrawals, transfers);
        
        // Deduplicate operations
        const uniqueOperations = deduplicateOperations(allOperations);
        
        // Sort operations by date
        const sortedOperations = sortOperationsByDate(uniqueOperations);
        
        // Format dates for display
        const formattedOperations = formatOperationsWithDates(sortedOperations);
        
        console.log(`Processing completed: ${formattedOperations.length} total operations ready for display`);
        
        return { 
          deposits, 
          withdrawals, 
          transfers,
          allOperations: formattedOperations 
        };
      }
      
      console.log('fetchAllOperations completed with no results (should not happen)');
      
      if (shouldUseMocksRef.current) {
        console.log('Using mock data as fallback after fetch failure');
        const mockOperations = transformToOperations(mockDeposits, mockWithdrawals, mockTransfers);
        const formattedMockOperations = formatOperationsWithDates(sortOperationsByDate(deduplicateOperations(mockOperations)));
        return { 
          deposits: mockDeposits, 
          withdrawals: mockWithdrawals, 
          transfers: mockTransfers, 
          allOperations: formattedMockOperations 
        };
      }
      
      return { deposits: [], withdrawals: [], transfers: [], allOperations: [] };
    } catch (error) {
      console.error('Error fetching all operations:', error);
      
      // Ensure we provide feedback to the user about the timeout
      if (error && typeof error === 'object' && 'message' in error && 
          error.message === 'Fetch operations timeout') {
        toast.error('Délai d\'attente dépassé lors de la récupération des opérations');
      } else {
        toast.error('Erreur lors de la récupération des opérations');
      }
      
      if (shouldUseMocksRef.current) {
        console.log('Using mock data as fallback after error');
        const mockOperations = transformToOperations(mockDeposits, mockWithdrawals, mockTransfers);
        const formattedMockOperations = formatOperationsWithDates(sortOperationsByDate(deduplicateOperations(mockOperations)));
        return { 
          deposits: mockDeposits, 
          withdrawals: mockWithdrawals, 
          transfers: mockTransfers, 
          allOperations: formattedMockOperations 
        };
      }
      
      // We still return empty arrays so the UI can render an empty state
      return { deposits: [], withdrawals: [], transfers: [], allOperations: [] };
    }
  }, [fetchDeposits, fetchWithdrawals, fetchTransfers]);

  // Clean up all abort controllers
  const cleanupAbortControllers = useCallback(() => {
    for (const [_, controller] of abortControllersRef.current.entries()) {
      controller.abort();
    }
    abortControllersRef.current.clear();
  }, []);

  return {
    fetchDeposits,
    fetchWithdrawals,
    fetchTransfers,
    fetchAllOperations,
    cleanupAbortControllers,
    setUseMocks
  };
};
