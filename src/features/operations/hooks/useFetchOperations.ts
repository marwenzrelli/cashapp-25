
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

  // Fonction pour transformer les données en type Operation
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

  // Fonction pour dédupliquer les opérations
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

  // Fonction pour récupérer les opérations
  const fetchOperations = useCallback(async (force: boolean = false) => {
    // Si une requête est déjà en cours et pas forcée, ne pas en démarrer une autre
    if (fetchingRef.current && !force) {
      console.log("Une requête est déjà en cours, ignorant cette requête");
      return;
    }
    
    // Si le dernier fetch était il y a moins de 2 secondes et pas forcé, ne pas fetch à nouveau
    const now = Date.now();
    if (!force && now - lastFetchTime < 2000) {
      console.log(`Dernier fetch il y a ${now - lastFetchTime}ms, ignorant cette requête`);
      return;
    }
    
    try {
      if (!isMountedRef.current) return;
      
      // Annuler toute requête en cours
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Créer un nouveau controller d'abandon
      abortControllerRef.current = new AbortController();
      
      fetchingRef.current = true;
      setIsLoading(true);
      setLastFetchTime(now);
      setFetchAttempts(prev => prev + 1);
      
      console.log("Fetching operations, attempt #", fetchAttempts + 1);
      
      // Configurer un timeout pour réinitialiser l'état de chargement si le fetch prend trop de temps
      const loadingTimeout = setTimeout(() => {
        if (fetchingRef.current && isMountedRef.current) {
          console.warn("Fetch operation timeout - resetting loading state");
          fetchingRef.current = false;
          setIsLoading(false);
          
          // Réinitialiser le controller d'abandon
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
          }
        }
      }, 10000); // 10 secondes timeout
      
      // Récupérer les données en parallèle pour améliorer les performances
      const [depositsResponse, withdrawalsResponse, transfersResponse] = await Promise.all([
        supabase.from('deposits').select('*').order('created_at', { ascending: false }),
        supabase.from('withdrawals').select('*').order('created_at', { ascending: false }),
        supabase.from('transfers').select('*').order('created_at', { ascending: false })
      ]);
      
      // Effacer le timeout car nous avons reçu une réponse
      clearTimeout(loadingTimeout);
      
      // Vérifier les erreurs
      if (depositsResponse.error) throw depositsResponse.error;
      if (withdrawalsResponse.error) throw withdrawalsResponse.error;
      if (transfersResponse.error) throw transfersResponse.error;
      
      if (!isMountedRef.current) return;

      // Transformer en type Operation commun
      const allOperations = transformToOperations(
        depositsResponse.data, 
        withdrawalsResponse.data, 
        transfersResponse.data
      );
      
      // Trier par date (plus récent d'abord)
      allOperations.sort((a, b) => {
        const dateA = new Date(a.operation_date || a.date);
        const dateB = new Date(b.operation_date || b.date);
        return dateB.getTime() - dateA.getTime();
      });

      console.log(`Fetched ${allOperations.length} operations (${depositsResponse.data?.length || 0} deposits, ${withdrawalsResponse.data?.length || 0} withdrawals, ${transfersResponse.data?.length || 0} transfers)`);
      
      // Dédupliquer les opérations avant de les définir
      const uniqueOperations = deduplicateOperations(allOperations);
      
      if (!isMountedRef.current) return;
      
      // Vérifier que nous avons effectivement obtenu des données avant d'effacer l'état d'erreur
      if (uniqueOperations.length > 0) {
        setOperations(uniqueOperations);
        setError(null);
        // Réinitialiser le compteur de tentatives en cas de succès
        maxRetries.current = 3;
      } else if (fetchAttempts < 2) {
        // Si nous n'avons obtenu aucune donnée à la première tentative, réessayer une fois
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
      
      // N'afficher le toast que si nous n'en avons pas montré récemment et s'il y a une vraie erreur
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
        
        // Effacer le controller d'abandon
        abortControllerRef.current = null;
      }
    }
  }, [lastFetchTime, fetchAttempts]);

  // Fetch initial avec un délai pour éviter les conditions de course
  useEffect(() => {
    isMountedRef.current = true;
    
    // Nettoyer tout timeout existant
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Démarrer un nouveau fetch avec délai
    fetchTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setIsLoading(true); // S'assurer que l'état de chargement est défini avant le fetch initial
        fetchOperations(true);
      }
    }, 100); // Réduit à 100ms au lieu de 500ms pour charger plus rapidement
    
    return () => {
      isMountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      // Annuler tout fetch en cours
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchOperations]);

  return { operations, isLoading, error, refreshOperations: fetchOperations };
};
