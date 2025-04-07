
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
    const response = await supabase
      .from('deposits')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (response.error) {
      console.error('Error fetching deposits:', response.error);
      throw response.error;
    }
    
    return response.data || [];
  }, []);

  /**
   * Fetches withdrawals from Supabase
   */
  const fetchWithdrawals = useCallback(async () => {
    const response = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (response.error) {
      console.error('Error fetching withdrawals:', response.error);
      throw response.error;
    }
    
    return response.data || [];
  }, []);

  /**
   * Fetches transfers from Supabase
   */
  const fetchTransfers = useCallback(async () => {
    const response = await supabase
      .from('transfers')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (response.error) {
      console.error('Error fetching transfers:', response.error);
      throw response.error;
    }
    
    return response.data || [];
  }, []);

  /**
   * Fetches all operation types concurrently
   */
  const fetchAllOperations = useCallback(async () => {
    try {
      const [deposits, withdrawals, transfers] = await Promise.all([
        fetchDeposits(),
        fetchWithdrawals(),
        fetchTransfers()
      ]);
      
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
