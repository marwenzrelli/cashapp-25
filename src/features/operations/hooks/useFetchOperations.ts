
import { useState, useEffect, useCallback, useRef } from 'react';
import { Operation } from '../types';
import { useOperationsFetcher } from './useOperationsFetcher';
import { toast } from "sonner";
import { logger } from '@/utils/logger';

/**
 * Hook pour récupérer les opérations depuis Supabase avec gestion d'erreurs
 */
export const useFetchOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getOperations } = useOperationsFetcher();
  
  const isMountedRef = useRef(true);
  const fetchingRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  
  const fetchOperations = useCallback(async (force = false) => {
    const now = Date.now();
    
    if (fetchingRef.current && !force) return;
    if (!force && now - lastFetchTimeRef.current < 1000) return;
    
    try {
      fetchingRef.current = true;
      setIsLoading(true);
      
      const data = await getOperations();
      
      if (isMountedRef.current) {
        logger.log(`Received ${data.length} operations`);
        setOperations(data);
        setError(null);
        lastFetchTimeRef.current = now;
        retryCountRef.current = 0;
      }
    } catch (err: any) {
      console.error('Error fetching operations:', err);
      
      if (isMountedRef.current) {
        setError(err.message || 'Erreur lors du chargement des données');
        
        if (force && retryCountRef.current < maxRetries) {
          retryCountRef.current += 1;
          setTimeout(() => fetchOperations(true), 2000 * Math.pow(1.5, retryCountRef.current - 1));
          return;
        }
        
        toast.error("Erreur de chargement", { 
          description: "Impossible de charger les opérations" 
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    }
  }, [getOperations]);

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  return { 
    operations, 
    isLoading, 
    error, 
    refreshOperations: fetchOperations,
    isMountedRef,
    fetchingRef,
    lastFetchTimeRef
  };
};
