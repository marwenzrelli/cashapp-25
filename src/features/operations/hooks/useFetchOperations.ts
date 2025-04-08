import { useState, useEffect, useCallback } from 'react';
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
  
  // Fonction simplifiée qui charge les données immédiatement
  const fetchOperations = useCallback(() => {
    try {
      setIsLoading(true);
      // Chargement synchrone, pas de delay
      const data = getOperations();
      setOperations(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching operations:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [getOperations]);

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
