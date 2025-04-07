
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
      // Increased timeout from 12s to 20s
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch deposits timeout')), 20000);
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
          return [];
        }
        
        console.log(`Fetched ${result.data?.length || 0} deposits`);
        return result.data || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error in fetchDeposits:', error);
      // Return empty array on error to avoid breaking the UI
      return [];
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
      // Increased timeout from 12s to 20s
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch withdrawals timeout')), 20000);
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
          return [];
        }
        
        console.log(`Fetched ${result.data?.length || 0} withdrawals`);
        return result.data || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error in fetchWithdrawals:', error);
      // Return empty array on error to avoid breaking the UI
      return [];
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
      // Increased timeout from 12s to 20s
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch transfers timeout')), 20000);
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
          return [];
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
      
      // Increased timeout from 20s to 30s
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch operations timeout')), 30000);
      });
      
      const fetchPromise = Promise.all([
        fetchDeposits().catch(() => []),
        fetchWithdrawals().catch(() => []),
        fetchTransfers().catch(() => [])
      ]);
      
      // Race the fetch against the timeout
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Type guard to ensure we have the fetchPromise result
      if (Array.isArray(result) && result.length === 3) {
        const [deposits, withdrawals, transfers] = result;
        
        console.log(`fetchAllOperations completed with ${deposits.length} deposits, ${withdrawals.length} withdrawals, ${transfers.length} transfers`);
        console.log('Raw data - deposits:', deposits.length, ', withdrawals:', withdrawals.length, ', transfers:', transfers.length);
        
        return { deposits, withdrawals, transfers };
      }
      
      console.log('fetchAllOperations completed with no results (should not happen)');
      return { deposits: [], withdrawals: [], transfers: [] };
    } catch (error) {
      console.error('Error fetching all operations:', error);
      
      // Ensure we provide feedback to the user about the timeout
      if (error && typeof error === 'object' && 'message' in error && 
          error.message === 'Fetch operations timeout') {
        toast.error('Délai d\'attente dépassé lors de la récupération des opérations');
      }
      
      // We still return empty arrays so the UI can render an empty state
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
