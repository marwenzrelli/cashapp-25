import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Operation } from '../types';
import { toast } from 'sonner';

export const useFetchOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [fetchAttempts, setFetchAttempts] = useState<number>(0);
  
  const isMountedRef = useRef<boolean>(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchingRef = useRef<boolean>(false);
  const maxRetries = useRef<number>(3);
  const abortControllerRef = useRef<AbortController | null>(null);

  const transformToOperations = (
    deposits: any[] = [], 
    withdrawals: any[] = [], 
    transfers: any[] = []
  ): Operation[] => {
    const transformedDeposits: Operation[] = deposits.map(deposit => ({
      id: deposit.id.toString(),
      type: 'deposit',
      amount: deposit.amount,
      date: deposit.created_at,
      operation_date: deposit.operation_date,
      description: deposit.notes || 'Versement',
      fromClient: deposit.client_name,
      client_id: deposit.client_id,
      status: deposit.status
    }));
    
    const transformedWithdrawals: Operation[] = withdrawals.map(withdrawal => ({
      id: withdrawal.id.toString(),
      type: 'withdrawal',
      amount: withdrawal.amount,
      date: withdrawal.created_at,
      operation_date: withdrawal.operation_date,
      description: withdrawal.notes || 'Retrait',
      fromClient: withdrawal.client_name,
      client_id: withdrawal.client_id,
      status: withdrawal.status
    }));
    
    const transformedTransfers: Operation[] = transfers.map(transfer => ({
      id: transfer.id.toString(),
      type: 'transfer',
      amount: transfer.amount,
      date: transfer.created_at,
      operation_date: transfer.operation_date,
      description: transfer.reason || 'Virement',
      fromClient: transfer.from_client,
      toClient: transfer.to_client,
      status: transfer.status
    }));

    return [...transformedDeposits, ...transformedWithdrawals, ...transformedTransfers];
  };

  const deduplicateOperations = (operations: Operation[]): Operation[] => {
    const uniqueMap = new Map<string, Operation>();
    operations.forEach(op => {
      const key = `${op.type}-${op.id}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, op);
      }
    });
    return Array.from(uniqueMap.values());
  };

  const fetchOperations = useCallback(async (force: boolean = false) => {
    if (fetchingRef.current && !force) {
      console.log("Une requête est déjà en cours, ignorant cette requête");
      return;
    }
    
    const now = Date.now();
    if (!force && now - lastFetchTime < 2000) {
      console.log(`Dernier fetch il y a ${now - lastFetchTime}ms, ignorant cette requête`);
      return;
    }
    
    try {
      if (!isMountedRef.current) return;
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      fetchingRef.current = true;
      setIsLoading(true);
      setLastFetchTime(now);
      setFetchAttempts(prev => prev + 1);
      
      console.log("Fetching operations, attempt #", fetchAttempts + 1);
      
      const loadingTimeout = setTimeout(() => {
        if (fetchingRef.current && isMountedRef.current) {
          console.warn("Fetch operation timeout - resetting loading state");
          fetchingRef.current = false;
          setIsLoading(false);
          
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
          }
        }
      }, 10000);
      
      const [depositsResponse, withdrawalsResponse, transfersResponse] = await Promise.all([
        supabase.from('deposits').select('*').order('created_at', { ascending: false }),
        supabase.from('withdrawals').select('*').order('created_at', { ascending: false }),
        supabase.from('transfers').select('*').order('created_at', { ascending: false })
      ]);
      
      clearTimeout(loadingTimeout);
      
      if (depositsResponse.error) throw depositsResponse.error;
      if (withdrawalsResponse.error) throw withdrawalsResponse.error;
      if (transfersResponse.error) throw transfersResponse.error;
      
      if (!isMountedRef.current) return;

      console.log("Raw deposits data:", depositsResponse.data);
      console.log("Raw withdrawals data:", withdrawalsResponse.data);
      console.log("Raw transfers data:", transfersResponse.data);

      const allOperations = transformToOperations(
        depositsResponse.data || [], 
        withdrawalsResponse.data || [], 
        transfersResponse.data || []
      );
      
      allOperations.sort((a, b) => {
        const dateA = new Date(a.operation_date || a.date);
        const dateB = new Date(b.operation_date || b.date);
        return dateB.getTime() - dateA.getTime();
      });

      console.log(`Fetched ${allOperations.length} operations (${depositsResponse.data?.length || 0} deposits, ${withdrawalsResponse.data?.length || 0} withdrawals, ${transfersResponse.data?.length || 0} transfers)`);
      
      const uniqueOperations = deduplicateOperations(allOperations);
      
      if (!isMountedRef.current) return;
      
      setOperations(uniqueOperations);
      setError(null);
      
      maxRetries.current = 3;
    } catch (err: any) {
      console.error('Error fetching operations:', err);
      setError(err.message);
      
      if (force || fetchAttempts <= 1) {
        toast.error('Erreur lors de la récupération des opérations');
      }
      
      if (maxRetries.current > 0) {
        const retryDelay = Math.min(2000 * Math.pow(2, 3 - maxRetries.current), 10000);
        console.log(`Will retry in ${retryDelay}ms, ${maxRetries.current} retries left`);
        maxRetries.current--;
        
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchOperations(true);
          }
        }, retryDelay);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        fetchingRef.current = false;
        
        abortControllerRef.current = null;
      }
    }
  }, [lastFetchTime, fetchAttempts]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    fetchTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setIsLoading(true);
        fetchOperations(true);
      }
    }, 100);
    
    return () => {
      isMountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchOperations]);

  return { operations, isLoading, error, refreshOperations: fetchOperations };
};
