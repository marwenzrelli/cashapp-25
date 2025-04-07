
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Operation } from '../types';
import { toast } from 'sonner';

export const useFetchOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [fetchAttempts, setFetchAttempts] = useState<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOperations = useCallback(async (force: boolean = false) => {
    // Si une requête est déjà en cours et ce n'est pas forcé, ne pas en lancer une autre
    if (!force && isLoading) {
      console.log("Une requête est déjà en cours, ignorant cette requête");
      return;
    }
    
    // Si dernier fetch était il y a moins de 2 secondes et pas forcé, ne pas fetch à nouveau
    const now = Date.now();
    if (!force && now - lastFetchTime < 2000) {
      console.log(`Dernier fetch il y a ${now - lastFetchTime}ms, ignorant cette requête`);
      return;
    }
    
    try {
      if (!isMountedRef.current) return;
      
      setIsLoading(true);
      setLastFetchTime(now);
      setFetchAttempts(prev => prev + 1);
      
      console.log("Fetching operations, attempt #", fetchAttempts + 1);
      
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

      if (!isMountedRef.current) return;

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

      console.log(`Fetched ${allOperations.length} operations (${transformedDeposits.length} deposits, ${transformedWithdrawals.length} withdrawals, ${transformedTransfers.length} transfers)`);
      
      // Dédupliquer les opérations avant de les définir
      const uniqueMap = new Map<string, Operation>();
      allOperations.forEach(op => {
        const key = `${op.type}-${op.id}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, op);
        }
      });
      
      const uniqueOperations = Array.from(uniqueMap.values());
      
      if (!isMountedRef.current) return;
      setOperations(uniqueOperations);
      setError(null);
    } catch (err: any) {
      if (!isMountedRef.current) return;
      console.error('Error fetching operations:', err);
      setError(err.message);
      toast.error('Erreur lors de la récupération des opérations');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [lastFetchTime, fetchAttempts, isLoading]);

  // Initial fetch avec un délai pour éviter les conditions de course
  useEffect(() => {
    isMountedRef.current = true;
    
    // Nettoyer tout timeout existant
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Démarrer un nouveau fetch avec délai
    fetchTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        fetchOperations(true);
      }
    }, 500);
    
    return () => {
      isMountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchOperations]);

  return { operations, isLoading, error, refreshOperations: fetchOperations };
};
