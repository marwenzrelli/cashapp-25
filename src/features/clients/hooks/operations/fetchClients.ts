
import { useState, useCallback, useRef, useEffect } from "react";
import { Client } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { showErrorToast } from "../utils/errorUtils";
import { handleSupabaseError } from "../utils/errorUtils";

export const useFetchClients = (
  setClients: React.Dispatch<React.SetStateAction<Client[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  // Configuration constants
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 3000; // 3 secondes
  
  // Utiliser une référence pour suivre si une notification d'erreur a déjà été affichée
  const errorNotifiedRef = useRef(false);
  // Utiliser une référence pour les opérations en cours
  const fetchingRef = useRef(false);
  // État pour suivre si l'appareil est hors ligne
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Écouter les changements d'état du réseau
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Réinitialiser le drapeau de notification d'erreur lorsque le réseau revient
      errorNotifiedRef.current = false;
      // Tenter de récupérer les données une fois de retour en ligne
      if (!fetchingRef.current) {
        fetchClients(0, true);
      }
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      if (!errorNotifiedRef.current) {
        showErrorToast("Connexion perdue", new Error("Vous êtes hors ligne. Certaines fonctionnalités peuvent ne pas être disponibles."));
        errorNotifiedRef.current = true;
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fonction pour mettre à jour les soldes des clients
  const updateClientBalances = async (clientsList: Client[]) => {
    if (!supabase || !clientsList.length || isOffline) return;
    
    try {
      // Traiter les clients par lots pour éviter de surcharger l'API
      const batchSize = 3;
      
      for (let i = 0; i < clientsList.length; i += batchSize) {
        const batch = clientsList.slice(i, i + batchSize);
        
        for (const client of batch) {
          try {
            // Vérifier si nous sommes toujours en ligne
            if (!navigator.onLine) {
              console.log("Mise à jour des soldes interrompue: appareil hors ligne");
              return;
            }
            
            // Calculer le solde du client avec timeout
            const balancePromise = supabase.rpc('calculate_client_balance', { client_id: client.id });
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error("La requête a expiré")), 8000);
            });
            
            const { data: balance, error: balanceError } = await Promise.race([
              balancePromise, 
              timeoutPromise
            ]) as any;

            if (balanceError) {
              console.warn(`Impossible de calculer le solde pour ${client.prenom} ${client.nom}:`, balanceError);
              continue;
            }

            // Mettre à jour le solde dans la base de données
            const updatePromise = supabase
              .from('clients')
              .update({ solde: balance || 0 })
              .eq('id', client.id);
              
            const { error: updateError } = await Promise.race([
              updatePromise,
              new Promise((_, reject) => {
                setTimeout(() => reject(new Error("La mise à jour a expiré")), 8000);
              })
            ]) as any;

            if (updateError) {
              console.warn(`Impossible de mettre à jour le solde pour ${client.prenom} ${client.nom}:`, updateError);
              continue;
            }

            // Mettre à jour le client dans l'état local
            setClients(prevClients => 
              prevClients.map(c => 
                c.id === client.id ? { ...c, solde: balance || 0 } : c
              )
            );
          } catch (error) {
            console.error(`Erreur pour le client ${client.id}:`, error);
          }
        }
        
        // Pause entre les lots pour éviter de surcharger l'API
        if (i + batchSize < clientsList.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des soldes:", error);
    }
  };

  // Fonction de récupération des clients
  const fetchClients = useCallback(async (retry = 0, showToast = true) => {
    // Si une récupération est déjà en cours, ne pas en démarrer une autre
    if (fetchingRef.current) {
      return;
    }
    
    // Vérifier si l'appareil est hors ligne
    if (!navigator.onLine) {
      if (showToast && !errorNotifiedRef.current) {
        showErrorToast("Appareil hors ligne", new Error("Impossible de récupérer les données. Veuillez vérifier votre connexion internet."));
        errorNotifiedRef.current = true;
      }
      setError("Problème de connexion réseau. Veuillez vérifier votre connexion internet.");
      setLoading(false);
      return;
    }
    
    fetchingRef.current = true;
    
    try {
      if (retry === 0) {
        setLoading(true);
        setError(null);
        // Réinitialiser le drapeau de notification d'erreur lors d'une nouvelle tentative
        errorNotifiedRef.current = false;
      }
      
      console.log(`Chargement des clients... (tentative ${retry + 1}/${MAX_RETRIES + 1})`);
      
      // Données de test pour simuler un succès en cas d'erreur persistante
      const mockData: Client[] = [];
      
      // Vérifier que la connexion à Supabase est établie
      if (!supabase) {
        throw new Error("La connexion à la base de données n'est pas disponible");
      }
      
      // Récupérer les clients avec un timeout de sécurité
      const fetchWithTimeout = async () => {
        const fetchPromise = supabase
          .from('clients')
          .select('*')
          .order('date_creation', { ascending: false });
          
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("La requête a expiré")), 10000);
        });
        
        return Promise.race([fetchPromise, timeoutPromise]);
      };
      
      const { data: clientsData, error: clientsError } = await fetchWithTimeout() as any;

      if (clientsError) {
        console.error("Erreur lors de la récupération des clients:", clientsError);
        
        // Si nous n'avons pas atteint le nombre maximal de tentatives, réessayer
        if (retry < MAX_RETRIES) {
          console.log(`Nouvelle tentative dans ${RETRY_DELAY/1000} secondes...`);
          setTimeout(() => fetchClients(retry + 1, false), RETRY_DELAY);
          return;
        }
        
        // Si toutes les tentatives ont échoué et que nous sommes en développement, utiliser des données de test
        if (process.env.NODE_ENV === 'development' && mockData.length > 0) {
          console.warn("Utilisation de données de test après échec de connexion");
          setClients(mockData);
          return;
        }
        
        // Sinon, lancer une erreur
        throw new Error(handleSupabaseError(clientsError));
      }

      if (!clientsData) {
        console.log("Aucune donnée reçue de la base de données");
        setClients([]);
        return;
      }

      console.log(`${clientsData.length} clients récupérés avec succès:`, clientsData);
      
      // Mettre à jour l'état avec les clients récupérés
      setClients(clientsData);
      
      // Pour éviter les problèmes de performance, limiter les appels à updateClientBalances
      if (clientsData.length > 0 && retry === 0 && navigator.onLine) {
        setTimeout(() => {
          try {
            updateClientBalances(clientsData);
          } catch (balanceError) {
            console.error("Erreur lors de la mise à jour des soldes:", balanceError);
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error("Erreur critique lors du chargement des clients:", error);
      
      // Si l'appareil est hors ligne, définir une erreur spécifique
      if (!navigator.onLine) {
        setError("Problème de connexion réseau. Veuillez vérifier votre connexion internet.");
        if (showToast && !errorNotifiedRef.current) {
          showErrorToast("Appareil hors ligne", new Error("Impossible de récupérer les données. Veuillez vérifier votre connexion internet."));
          errorNotifiedRef.current = true;
        }
        setLoading(false);
        fetchingRef.current = false;
        return;
      }
      
      if (retry < MAX_RETRIES) {
        console.log(`Nouvelle tentative dans ${RETRY_DELAY/1000} secondes...`);
        setTimeout(() => fetchClients(retry + 1, false), RETRY_DELAY);
        return;
      }
      
      setError(handleSupabaseError(error));
      
      // Afficher la notification d'erreur seulement si nous n'en avons pas encore affiché et si showToast est true
      if (showToast && !errorNotifiedRef.current) {
        showErrorToast("Erreur de connexion", error);
        errorNotifiedRef.current = true;
      }
    } finally {
      if (retry === 0 || retry === MAX_RETRIES) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, [setClients, setLoading, setError, isOffline]);

  return { fetchClients };
};
