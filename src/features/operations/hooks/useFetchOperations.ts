
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Operation } from '../types';
import { toast } from 'sonner';

export const useFetchOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const fetchOperations = useCallback(async () => {
    // If last fetch was less than 1 second ago, don't fetch again (prevent multiple quick fetches)
    const now = Date.now();
    if (now - lastFetchTime < 1000) {
      return;
    }
    
    try {
      setIsLoading(true);
      setLastFetchTime(now);
      
      // Fetch deposits with client_id
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (depositsError) throw depositsError;
      
      // Fetch withdrawals with client_id
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (withdrawalsError) throw withdrawalsError;
      
      // Fetch transfers
      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (transfersError) throw transfersError;

      // Transform to common Operation type, CONVERTING ID TO STRING
      const transformedDeposits: Operation[] = (deposits || []).map(deposit => ({
        id: deposit.id.toString(), // Convert number to string
        type: 'deposit',
        amount: deposit.amount,
        date: deposit.created_at,
        operation_date: deposit.operation_date,
        description: deposit.notes || 'Versement',
        fromClient: deposit.client_name,
        client_id: deposit.client_id,
        status: deposit.status
      }));
      
      const transformedWithdrawals: Operation[] = (withdrawals || []).map(withdrawal => ({
        id: withdrawal.id.toString(), // Convert number to string
        type: 'withdrawal',
        amount: withdrawal.amount,
        date: withdrawal.created_at,
        operation_date: withdrawal.operation_date,
        description: withdrawal.notes || 'Retrait',
        fromClient: withdrawal.client_name,
        client_id: withdrawal.client_id,
        status: withdrawal.status
      }));
      
      const transformedTransfers: Operation[] = (transfers || []).map(transfer => ({
        id: transfer.id.toString(), // Convert number to string
        type: 'transfer',
        amount: transfer.amount,
        date: transfer.created_at,
        operation_date: transfer.operation_date,
        description: transfer.reason || 'Virement',
        fromClient: transfer.from_client,
        toClient: transfer.to_client,
        status: transfer.status
      }));

      const allOperations = [
        ...transformedDeposits,
        ...transformedWithdrawals,
        ...transformedTransfers
      ];
      
      // Sort by date (most recent first)
      allOperations.sort((a, b) => {
        const dateA = new Date(a.operation_date || a.date);
        const dateB = new Date(b.operation_date || b.date);
        return dateB.getTime() - dateA.getTime();
      });

      setOperations(allOperations);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching operations:', err);
      setError(err.message);
      toast.error('Erreur lors de la récupération des opérations');
    } finally {
      setIsLoading(false);
    }
  }, [lastFetchTime]);

  // Initial fetch
  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  return { operations, isLoading, error, refreshOperations: fetchOperations };
};
