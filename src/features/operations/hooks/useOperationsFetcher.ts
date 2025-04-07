
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
  }, []);

  /**
   * Fetches all operation types concurrently
   */
  const fetchAllOperations = useCallback(async () => {
    try {
      console.log('Starting fetchAllOperations...');
      const [deposits, withdrawals, transfers] = await Promise.all([
        fetchDeposits(),
        fetchWithdrawals(),
        fetchTransfers()
      ]);
      
      console.log(`fetchAllOperations completed with ${deposits.length} deposits, ${withdrawals.length} withdrawals, ${transfers.length} transfers`);
      
      return { deposits, withdrawals, transfers };
    } catch (error) {
      console.error('Error fetching all operations:', error);
      throw error;
    }
  }, [fetchDeposits, fetchWithdrawals, fetchTransfers]);

  return {
    fetchDeposits,
    fetchWithdrawals,
    fetchTransfers,
    fetchAllOperations
  };
};
