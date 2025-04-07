
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
  const fetchingRef = useRef<boolean>(false);
  const maxRetries = useRef<number>(3);

  const fetchOperations = useCallback(async (force: boolean = false) => {
    // Si une requête est déjà en cours et ce n'est pas forcé, ne pas en lancer une autre
    if (fetchingRef.current && !force) {
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
      
      fetchingRef.current = true;
      setIsLoading(true);
      setLastFetchTime(now);
      setFetchAttempts(prev => prev + 1);
      
      console.log("Fetching operations, attempt #", fetchAttempts + 1);
      
      // Setup a timeout to automatically reset the loading state if the fetch takes too long
      const loadingTimeout = setTimeout(() => {
        if (fetchingRef.current && isMountedRef.current) {
          console.warn("Fetch operation timeout - resetting loading state");
          fetchingRef.current = false;
          setIsLoading(false);
        }
      }, 15000); // 15 seconds timeout
      
      // Fetch deposits with client_id
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Clear the timeout as we got a response
      clearTimeout(loadingTimeout);
      
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
      
      // Verify that we actually got data before clearing error state
      if (uniqueOperations.length > 0) {
        setOperations(uniqueOperations);
        setError(null);
        // Reset retry counter on success
        maxRetries.current = 3;
      } else if (fetchAttempts < 2) {
        // If we didn't get any data on the first attempt, try again once
        console.log("No operations found, retrying automatically");
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchOperations(true);
          }
        }, 1000);
        return;
      } else {
        console.log("No operations found after retry");
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      console.error('Error fetching operations:', err);
      setError(err.message);
      
      // Only show toast if we haven't shown one recently and there's a real error
      if (force || fetchAttempts <= 1) {
        toast.error('Erreur lors de la récupération des opérations');
      }
      
      // Auto-retry with exponential backoff if we have retries left
      if (maxRetries.current > 0) {
        const retryDelay = Math.min(2000 * Math.pow(2, 3 - maxRetries.current), 10000);
        console.log(`Will retry in ${retryDelay}ms, ${maxRetries.current} retries left`);
        maxRetries.current--;
        
        setTimeout(() => {
          if (isMountedRef.current) {
            console.log("Auto-retrying fetch after error");
            fetchOperations(true);
          }
        }, retryDelay);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    }
  }, [lastFetchTime, fetchAttempts]);

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
    }, 100); // Réduit à 100ms au lieu de 500ms pour charger plus rapidement
    
    return () => {
      isMountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchOperations]);

  return { operations, isLoading, error, refreshOperations: fetchOperations };
};
