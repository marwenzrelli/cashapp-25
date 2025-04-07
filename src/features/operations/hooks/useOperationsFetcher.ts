
import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      
      // Create the database query promise with proper typing
      const queryPromise = supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Race the promises with proper type handling
      const response = await Promise.race([queryPromise, timeoutPromise]);
      
      if ('error' in response) {
        console.error('Error fetching deposits:', response.error);
        toast.error('Erreur lors de la récupération des versements');
        throw response.error;
      }
      
      console.log(`Fetched ${response.data?.length || 0} deposits`);
      return response.data || [];
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
      
      // Create the database query promise with proper typing
      const queryPromise = supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Race the promises with proper type handling
      const response = await Promise.race([queryPromise, timeoutPromise]);
      
      if ('error' in response) {
        console.error('Error fetching withdrawals:', response.error);
        toast.error('Erreur lors de la récupération des retraits');
        throw response.error;
      }
      
      console.log(`Fetched ${response.data?.length || 0} withdrawals`);
      return response.data || [];
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
      
      // Create the database query promise with proper typing
      const queryPromise = supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Race the promises with proper type handling
      const response = await Promise.race([queryPromise, timeoutPromise]);
      
      if ('error' in response) {
        console.error('Error fetching transfers:', response.error);
        toast.error('Erreur lors de la récupération des virements');
        throw response.error;
      }
      
      console.log(`Fetched ${response.data?.length || 0} transfers`);
      return response.data || [];
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
        setTimeout(() => reject(new Error('Fetch operations timeout')), 20000); // Increased from 15s to 20s
      });
      
      const fetchPromise = Promise.all([
        fetchDeposits(),
        fetchWithdrawals(),
        fetchTransfers()
      ]);
      
      // Race the fetch against the timeout
      const [deposits, withdrawals, transfers] = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as [any[], any[], any[]];
      
      console.log(`fetchAllOperations completed with ${deposits.length} deposits, ${withdrawals.length} withdrawals, ${transfers.length} transfers`);
      
      return { deposits, withdrawals, transfers };
    } catch (error) {
      console.error('Error fetching all operations:', error);
      if (error instanceof Error && error.message === 'Timeout') {
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
