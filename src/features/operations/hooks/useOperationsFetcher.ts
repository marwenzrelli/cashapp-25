
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook that provides functions to fetch operations data from Supabase
 */
export const useOperationsFetcher = () => {
  /**
   * Fetches deposits from Supabase
   */
  const fetchDeposits = useCallback(async () => {
    console.log('Fetching deposits...');
    const response = await supabase
      .from('deposits')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (response.error) {
      console.error('Error fetching deposits:', response.error);
      toast.error('Erreur lors de la récupération des versements');
      throw response.error;
    }
    
    console.log(`Fetched ${response.data?.length || 0} deposits`);
    return response.data || [];
  }, []);

  /**
   * Fetches withdrawals from Supabase
   */
  const fetchWithdrawals = useCallback(async () => {
    console.log('Fetching withdrawals...');
    const response = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (response.error) {
      console.error('Error fetching withdrawals:', response.error);
      toast.error('Erreur lors de la récupération des retraits');
      throw response.error;
    }
    
    console.log(`Fetched ${response.data?.length || 0} withdrawals`);
    return response.data || [];
  }, []);

  /**
   * Fetches transfers from Supabase
   */
  const fetchTransfers = useCallback(async () => {
    console.log('Fetching transfers...');
    try {
      const response = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (response.error) {
        console.error('Error fetching transfers:', response.error);
        toast.error('Erreur lors de la récupération des virements');
        throw response.error;
      }
      
      console.log(`Fetched ${response.data?.length || 0} transfers`);
      return response.data || [];
    } catch (error) {
      console.error('Error in fetchTransfers:', error);
      return [];
    }
  }, []);

  /**
   * Fetches all operation types concurrently
   */
  const fetchAllOperations = useCallback(async () => {
    try {
      console.log('Starting fetchAllOperations...');
      
      // Set a timeout to ensure we don't hang forever
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Fetch operations timeout')), 15000);
      });
      
      const fetchPromise = Promise.all([
        fetchDeposits(),
        fetchWithdrawals(),
        fetchTransfers()
      ]);
      
      // Race the fetch against the timeout
      const [deposits, withdrawals, transfers] = await Promise.race([
        fetchPromise,
        timeoutPromise.then(() => {
          console.warn('Fetch operations timed out');
          throw new Error('Timeout');
        })
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

  return {
    fetchDeposits,
    fetchWithdrawals,
    fetchTransfers,
    fetchAllOperations
  };
};
