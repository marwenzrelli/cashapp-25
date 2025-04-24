
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
  const forceRefreshRef = useRef(false);
  const forceRefreshCountRef = useRef(0);
  const retryCountRef = useRef(0);
  const maxRetries = 5;
  
  // Fonction qui charge les données de façon asynchrone
  const fetchOperations = useCallback(async (force = false) => {
    // Si force=true, on va ignorer les contrôles de durée et de fetch en cours
    const now = Date.now();
    
    if (fetchingRef.current && !force) {
      console.log("Déjà en cours de chargement, ignorant cette requête");
      return;
    }
    
    // Rate limiting sauf si force=true
    if (!force && now - lastFetchTimeRef.current < 1000) {
      console.log("Trop de requêtes rapprochées, ignorant cette requête");
      return;
    }
    
    // Si force=true, marquer pour un second refresh et incrémenter le compteur
    if (force) {
      forceRefreshRef.current = true;
      forceRefreshCountRef.current += 1;
      console.log(`Rafraîchissement forcé #${forceRefreshCountRef.current}`);
    }
    
    try {
      fetchingRef.current = true;
      setIsLoading(true);
      
      console.log("Chargement des opérations depuis Supabase...", force ? "(rafraîchissement forcé)" : "");
      // Ajouter un paramètre aléatoire pour éviter le cache et l'historique des rafraîchissements forcés
      const cacheBuster = force 
        ? `?timestamp=${Date.now()}&force=${forceRefreshCountRef.current}&r=${Math.random().toString(36).substring(7)}` 
        : '';
      const data = await getOperations(cacheBuster);
      
      if (isMountedRef.current) {
        console.log("Données reçues:", data.length, "opérations");
        console.log("Types d'opérations:", data.map(op => op.type).join(', '));
        setOperations(data);
        setError(null);
        lastFetchTimeRef.current = now;
        retryCountRef.current = 0;
        
        // Si c'était un forçage, planifier un second rafraîchissement après un délai
        if (forceRefreshRef.current) {
          forceRefreshRef.current = false;
          setTimeout(() => {
            console.log("Effectuant un second rafraîchissement après suppression...");
            fetchOperations(true);
          }, 4000); // Augmenter le délai pour s'assurer que les données sont bien à jour
          
          // Puis un troisième rafraîchissement encore plus tard
          setTimeout(() => {
            console.log("Effectuant un troisième rafraîchissement après suppression...");
            fetchOperations(true);
          }, 8000);
        }
      }
    } catch (err: any) {
      console.error('Error fetching operations:', err);
      
      if (isMountedRef.current) {
        setError(err.message || 'Erreur lors du chargement des données');
        
        // Si c'est un force refresh, on peut réessayer quelques fois
        if (force && retryCountRef.current < maxRetries) {
          retryCountRef.current += 1;
          console.log(`Tentative de rafraîchissement #${retryCountRef.current}/${maxRetries}`);
          
          setTimeout(() => {
            console.log("Nouvelle tentative après erreur...");
            fetchOperations(true);
          }, 2000 * Math.pow(1.5, retryCountRef.current - 1)); // Backoff exponentiel
          
          return;
        }
        
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

  // Exposer les méthodes et l'état
  return { 
    operations, 
    isLoading, 
    error, 
    refreshOperations: fetchOperations,
    isMountedRef,
    fetchingRef,
    lastFetchTimeRef,
    forceRefreshRef,
    forceRefreshCountRef,
    retryCountRef
  };
};
