
import { useState, useEffect, useCallback, useRef } from 'react';
import { Operation } from '../types';
import { useOperationsFetcher } from './useOperationsFetcher';

/**
 * Hook ultra-simplifié pour récupérer les opérations avec performance maximale
 */
export const useFetchOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getOperations } = useOperationsFetcher();
  
  // Références pour le contrôle du fetch
  const isMountedRef = useRef(true);
  const fetchingRef = useRef(false);
  
  // Fonction simplifiée qui charge les données immédiatement
  const fetchOperations = useCallback(() => {
    try {
      if (fetchingRef.current) {
        console.log("Déjà en cours de chargement, ignorant cette requête");
        return;
      }
      
      fetchingRef.current = true;
      setIsLoading(true);
      
      // Chargement synchrone, pas de delay
      const data = getOperations();
      setOperations(data);
      setError(null);
      
      fetchingRef.current = false;
    } catch (err: any) {
      console.error('Error fetching operations:', err);
      setError(err.message || 'Erreur lors du chargement des données');
      fetchingRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [getOperations]);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Chargement initial
  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  return { 
    operations, 
    isLoading, 
    error, 
    refreshOperations: fetchOperations 
  };
};
