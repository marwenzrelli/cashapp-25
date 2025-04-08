
import { useState, useEffect, useCallback, useRef } from 'react';
import { Operation } from '../types';
import { useOperationsFetcher } from './useOperationsFetcher';
import { toast } from "sonner";

/**
 * Hook pour récupérer les opérations depuis Supabase avec gestion d'erreurs
 */
export const useFetchOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getOperations, getMockOperations } = useOperationsFetcher();
  
  // Références pour le contrôle du fetch
  const isMountedRef = useRef(true);
  const fetchingRef = useRef(false);
  
  // Fonction qui charge les données de façon asynchrone
  const fetchOperations = useCallback(async (force = false) => {
    // Éviter les requêtes multiples
    if (fetchingRef.current && !force) {
      console.log("Déjà en cours de chargement, ignorant cette requête");
      return;
    }
    
    try {
      fetchingRef.current = true;
      setIsLoading(true);
      
      console.log("Chargement des opérations depuis Supabase...");
      const data = await getOperations();
      
      if (isMountedRef.current) {
        setOperations(data);
        setError(null);
      }
    } catch (err: any) {
      console.error('Error fetching operations:', err);
      
      if (isMountedRef.current) {
        setError(err.message || 'Erreur lors du chargement des données');
        toast.error("Erreur de chargement", { 
          description: "Affichage des données locales" 
        });
        
        // Fallback aux données mock en cas d'erreur
        const mockData = getMockOperations();
        setOperations(mockData);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    }
  }, [getOperations, getMockOperations]);

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
