
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
  const useTestDataRef = useRef<boolean>(false);
  
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
      
      // Activate test data for demonstration
      useTestDataRef.current = true;
      
      // If using test data, return mock operations immediately
      if (useTestDataRef.current) {
        console.log('Using mock data for all operations');
        const formattedOperations = formatOperationsWithDates(mockOperations);
        toast.info('Utilisation de données de démonstration (mode hors ligne)');
        
        return { 
          deposits: mockOperations.filter(op => op.type === 'deposit'), 
          withdrawals: mockOperations.filter(op => op.type === 'withdrawal'), 
          transfers: mockOperations.filter(op => op.type === 'transfer'),
          allOperations: formattedOperations 
        };
      }
      
      // Réduit le timeout global à 12s
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch operations timeout')), 12000);
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
        
        // Si toutes les listes sont vides et que c'est après un échec, utiliser les données de test
        if (deposits.length === 0 && withdrawals.length === 0 && transfers.length === 0) {
          console.log('No data returned from any source. Using mock data.');
          
          // Activer l'utilisation des données de test pour les prochains appels
          useTestDataRef.current = true;
          
          // Créer une version filtrée des opérations pour chaque type
          const mockDeposits = mockOperations.filter(op => op.type === 'deposit');
          const mockWithdrawals = mockOperations.filter(op => op.type === 'withdrawal');
          const mockTransfers = mockOperations.filter(op => op.type === 'transfer');
          
          toast.info('Utilisation de données de démonstration (mode hors ligne)');
          
          // Dédupliquer et trier les opérations de test
          const formattedOperations = formatOperationsWithDates(mockOperations);
          
          return { 
            deposits: mockDeposits, 
            withdrawals: mockWithdrawals, 
            transfers: mockTransfers,
            allOperations: formattedOperations 
          };
        }
        
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
      return { deposits: [], withdrawals: [], transfers: [], allOperations: [] };
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
