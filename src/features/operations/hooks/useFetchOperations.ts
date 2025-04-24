
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
  const lastFetchTimeRef = useRef<number>(0);
  
  // Fonction qui charge les données de façon asynchrone
  const fetchOperations = useCallback(async (force = false) => {
    // Éviter les requêtes multiples rapprochées, sauf si forcé
    const now = Date.now();
    if (fetchingRef.current && !force) {
      console.log("Déjà en cours de chargement, ignorant cette requête");
      return;
    }
    
    // Rate limiting sauf si force=true
    if (!force && now - lastFetchTimeRef.current < 2000) {
      console.log("Trop de requêtes rapprochées, ignorant cette requête");
      return;
    }
    
    try {
      fetchingRef.current = true;
      setIsLoading(true);
      
      console.log("Chargement des opérations depuis Supabase...", force ? "(rafraîchissement forcé)" : "");
      // Ajouter un paramètre aléatoire pour éviter le cache
      const cacheBuster = force ? `?timestamp=${Date.now()}` : '';
      const data = await getOperations(cacheBuster);
      
      if (isMountedRef.current) {
        console.log("Données reçues:", data.length, "opérations");
        setOperations(data);
        setError(null);
        lastFetchTimeRef.current = now;
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
