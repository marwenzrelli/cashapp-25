
import { useState, useCallback, useRef } from "react";
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
  const MAX_RETRIES = 2; // Reduced from 3
  const RETRY_DELAY = 2000; // Reduced from 3000
  
  // Utiliser une référence pour suivre si une notification d'erreur a déjà été affichée
  const errorNotifiedRef = useRef(false);
  // Utiliser une référence pour les opérations en cours
  const fetchingRef = useRef(false);

  // Fonction pour mettre à jour les soldes des clients
  const updateClientBalances = async (clientsList: Client[]) => {
    if (!supabase || !clientsList.length) return;
    
    try {
      // Prioritize recent clients for balance updates
      const sortedClients = [...clientsList].sort((a, b) => {
        const dateA = new Date(a.date_creation).getTime();
        const dateB = new Date(b.date_creation).getTime();
        return dateB - dateA;
      });
      
      // Process 5 clients at a time, prioritizing recently created clients
      const batchSize = 5;
      
      for (let i = 0; i < sortedClients.length; i += batchSize) {
        const batch = sortedClients.slice(i, i + batchSize);
        
        // Use Promise.all to process the batch in parallel
        await Promise.all(batch.map(async (client) => {
          try {
            const clientName = `${client.prenom} ${client.nom}`;
            
            // Fetch deposits and withdrawals in parallel
            const [depositsResult, withdrawalsResult] = await Promise.all([
              supabase.from('deposits').select('amount').eq('client_name', clientName),
              supabase.from('withdrawals').select('amount').eq('client_name', clientName)
            ]);
            
            const deposits = depositsResult.data || [];
            const withdrawals = withdrawalsResult.data || [];
            
            const depositsTotal = deposits.reduce((sum, d) => sum + Number(d.amount), 0);
            const withdrawalsTotal = withdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
            const balance = depositsTotal - withdrawalsTotal;

            // Only update if balance has changed
            if (client.solde !== balance) {
              // Update database
              const { error: updateError } = await supabase
                .from('clients')
                .update({ solde: balance || 0 })
                .eq('id', client.id);

              if (updateError) {
                console.warn(`Impossible de mettre à jour le solde pour ${clientName}:`, updateError);
                return;
              }

              // Update local state
              setClients(prevClients => 
                prevClients.map(c => 
                  c.id === client.id ? { ...c, solde: balance || 0 } : c
                )
              );
            }
          } catch (error) {
            console.error(`Erreur pour le client ${client.id}:`, error);
          }
        }));
        
        // Pause between batches
        if (i + batchSize < sortedClients.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
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
    
    fetchingRef.current = true;
    
    try {
      if (retry === 0) {
        setLoading(true);
        setError(null);
        // Réinitialiser le drapeau de notification d'erreur lors d'une nouvelle tentative
        errorNotifiedRef.current = false;
      }
      
      console.log(`Chargement des clients... (tentative ${retry + 1}/${MAX_RETRIES + 1})`);
      
      // Vérifier que la connexion à Supabase est établie
      if (!supabase) {
        throw new Error("La connexion à la base de données n'est pas disponible");
      }
      
      // Récupérer les clients avec un timeout de sécurité
      const fetchWithTimeout = async () => {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("La requête a expiré")), 8000); // Reduced from 10000
        });
        
        const fetchPromise = supabase
          .from('clients')
          .select('*')
          .order('date_creation', { ascending: false });
        
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
      
      // Update balances in background after loading clients
      if (clientsData.length > 0) {
        // Update balances in the background
        setTimeout(() => {
          updateClientBalances(clientsData);
        }, 200);
      }
      
    } catch (error) {
      console.error("Erreur critique lors du chargement des clients:", error);
      
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
  }, [setClients, setLoading, setError]);

  return { fetchClients };
};
