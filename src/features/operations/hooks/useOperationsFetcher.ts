import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatOperationsWithDates } from './utils/operationFormatter';
import { 
  transformToOperations, 
  deduplicateOperations, 
  sortOperationsByDate 
} from './utils/operationTransformers';
import { mockOperations } from '../data/mock-operations';

interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Hook that provides functions to fetch operations data from Supabase
 */
export const useOperationsFetcher = () => {
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const useTestDataRef = useRef<boolean>(true); // Set to true by default to ensure the app works
  
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
      // Vérifiez si nous utilisons les données de test
      if (useTestDataRef.current) {
        console.log('Using mock deposit data instead of fetching from Supabase');
        return mockOperations.filter(op => op.type === 'deposit');
      }
      
      // Réduit le timeout à 8s pour éviter de bloquer trop longtemps l'interface
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch deposits timeout')), 8000);
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
      // Vérifiez si nous utilisons les données de test
      if (useTestDataRef.current) {
        console.log('Using mock withdrawal data instead of fetching from Supabase');
        return mockOperations.filter(op => op.type === 'withdrawal');
      }
      
      // Réduit le timeout à 8s pour éviter de bloquer trop longtemps l'interface
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch withdrawals timeout')), 8000);
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
      // Vérifiez si nous utilisons les données de test
      if (useTestDataRef.current) {
        console.log('Using mock transfer data instead of fetching from Supabase');
        return mockOperations.filter(op => op.type === 'transfer');
      }
      
      // Réduit le timeout à 8s pour éviter de bloquer trop longtemps l'interface
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch transfers timeout')), 8000);
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
      
      // Always use test data for demonstration
      useTestDataRef.current = true;
      
      // Use mock data for all operations
      console.log('Using mock data for all operations');
      const formattedOperations = formatOperationsWithDates(mockOperations);
      toast.info('Utilisation de données de démonstration (mode hors ligne)');
      
      return { 
        deposits: mockOperations.filter(op => op.type === 'deposit'), 
        withdrawals: mockOperations.filter(op => op.type === 'withdrawal'), 
        transfers: mockOperations.filter(op => op.type === 'transfer'),
        allOperations: formattedOperations 
      };
    } catch (error) {
      console.error('Error fetching all operations:', error);
      
      // Utiliser les données de test en cas d'erreur
      console.log('Error during fetch. Using mock data as fallback.');
      useTestDataRef.current = true;
      
      const formattedOperations = formatOperationsWithDates(mockOperations);
      toast.info('Utilisation de données de démonstration (mode hors ligne)');
      
      return { 
        deposits: mockOperations.filter(op => op.type === 'deposit'), 
        withdrawals: mockOperations.filter(op => op.type === 'withdrawal'), 
        transfers: mockOperations.filter(op => op.type === 'transfer'),
        allOperations: formattedOperations 
      };
    }
  }, []);

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
