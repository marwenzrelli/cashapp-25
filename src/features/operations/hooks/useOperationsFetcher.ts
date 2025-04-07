
import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Hook that provides functions to fetch operations data from Supabase
 */
export const useOperationsFetcher = () => {
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  
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
   * Fetches deposits from Supabase
   */
  const fetchDeposits = useCallback(async () => {
    console.log('Fetching deposits...');
    const controller = createAbortController('deposits');
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch deposits timeout')), 12000);
      });
      
      // Create the database query promise and execute it immediately to get a proper Promise
      const queryPromise = supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false })
        .then(result => result as SupabaseResponse<any[]>);
      
      // Race the promises with proper type handling
      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      if (result && 'data' in result) {
        if (result.error) {
          console.error('Error fetching deposits:', result.error);
          toast.error('Erreur lors de la récupération des versements');
          throw result.error;
        }
        
        console.log(`Fetched ${result.data?.length || 0} deposits`);
        return result.data || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error in fetchDeposits:', error);
      throw error;
    } finally {
      removeAbortController('deposits');
    }
  }, [createAbortController, removeAbortController]);

  /**
   * Fetches withdrawals from Supabase
   */
  const fetchWithdrawals = useCallback(async () => {
    console.log('Fetching withdrawals...');
    const controller = createAbortController('withdrawals');
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch withdrawals timeout')), 12000);
      });
      
      // Create the database query promise and execute it immediately to get a proper Promise
      const queryPromise = supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false })
        .then(result => result as SupabaseResponse<any[]>);
      
      // Race the promises with proper type handling
      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      // Type guard to ensure result is from queryPromise, not timeoutPromise
      if (result && 'data' in result) {
        if (result.error) {
          console.error('Error fetching withdrawals:', result.error);
          toast.error('Erreur lors de la récupération des retraits');
          throw result.error;
        }
        
        console.log(`Fetched ${result.data?.length || 0} withdrawals`);
        return result.data || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error in fetchWithdrawals:', error);
      throw error;
    } finally {
      removeAbortController('withdrawals');
    }
  }, [createAbortController, removeAbortController]);

  /**
   * Fetches transfers from Supabase
   */
  const fetchTransfers = useCallback(async () => {
    console.log('Fetching transfers...');
    const controller = createAbortController('transfers');
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch transfers timeout')), 12000);
      });
      
      // Create the database query promise and execute it immediately to get a proper Promise
      const queryPromise = supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false })
        .then(result => result as SupabaseResponse<any[]>);
      
      // Race the promises with proper type handling
      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      // Type guard to ensure result is from queryPromise, not timeoutPromise
      if (result && 'data' in result) {
        if (result.error) {
          console.error('Error fetching transfers:', result.error);
          toast.error('Erreur lors de la récupération des virements');
          throw result.error;
        }
        
        console.log(`Fetched ${result.data?.length || 0} transfers`);
        return result.data || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error in fetchTransfers:', error);
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
      
      // Set a timeout to ensure we don't hang forever
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch operations timeout')), 20000);
      });
      
      const fetchPromise = Promise.all([
        fetchDeposits(),
        fetchWithdrawals(),
        fetchTransfers()
      ]);
      
      // Race the fetch against the timeout
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Type guard to ensure we have the fetchPromise result
      if (Array.isArray(result) && result.length === 3) {
        const [deposits, withdrawals, transfers] = result;
        
        console.log(`fetchAllOperations completed with ${deposits.length} deposits, ${withdrawals.length} withdrawals, ${transfers.length} transfers`);
        
        return { deposits, withdrawals, transfers };
      }
      
      // This should not happen due to the rejected promise in timeoutPromise
      return { deposits: [], withdrawals: [], transfers: [] };
    } catch (error) {
      console.error('Error fetching all operations:', error);
      if (error && typeof error === 'object' && 'message' in error && 
          error.message === 'Fetch operations timeout') {
        toast.error('Délai d\'attente dépassé lors de la récupération des opérations');
      }
      // Return empty arrays so the UI can still render
      return { deposits: [], withdrawals: [], transfers: [] };
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
    cleanupAbortControllers
  };
};
