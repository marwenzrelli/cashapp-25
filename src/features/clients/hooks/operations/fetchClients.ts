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
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; 
  
  // Use a reference to track if an error notification has already been shown
  const errorNotifiedRef = useRef(false);
  // Use a reference to track ongoing operations
  const fetchingRef = useRef(false);
  // Use a reference to track timeout
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Use a counter for fetch attempts
  const fetchAttemptsRef = useRef(0);

  // Function to update client balances with new transfer logic
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
            
            // Fetch all operations in parallel with new transfer logic
            const [depositsResult, withdrawalsResult, transfersReceivedResult, transfersSentResult] = await Promise.all([
              supabase.from('deposits').select('amount').eq('client_name', clientName).eq('status', 'completed'),
              supabase.from('withdrawals').select('amount').eq('client_name', clientName).eq('status', 'completed'),
              supabase.from('transfers').select('amount').eq('to_client', clientName).eq('status', 'completed'),
              supabase.from('transfers').select('amount').eq('from_client', clientName).eq('status', 'completed')
            ]);
            
            const deposits = depositsResult.data || [];
            const withdrawals = withdrawalsResult.data || [];
            const transfersReceived = transfersReceivedResult.data || [];
            const transfersSent = transfersSentResult.data || [];
            
            const depositsTotal = deposits.reduce((sum, d) => sum + Number(d.amount), 0);
            const withdrawalsTotal = withdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
            const transfersReceivedTotal = transfersReceived.reduce((sum, tr) => sum + Number(tr.amount), 0);
            const transfersSentTotal = transfersSent.reduce((sum, ts) => sum + Number(ts.amount), 0);
            
            // New balance calculation: deposits + transfers received - withdrawals - transfers sent
            const balance = depositsTotal + transfersReceivedTotal - withdrawalsTotal - transfersSentTotal;

            console.log(`Balance calculated for ${clientName}: 
              Deposits: ${depositsTotal}, 
              Withdrawals: ${withdrawalsTotal}, 
              Transfers Received: ${transfersReceivedTotal},
              Transfers Sent: ${transfersSentTotal},
              Final balance: ${balance}`);

            // Only update if balance has changed
            if (Math.abs(client.solde - balance) > 0.01) { // Use small threshold for floating point comparison
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

  // Function to fetch clients
  const fetchClients = useCallback(async (retry = 0, showToast = true) => {
    // Clear previous timeout if exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // If a fetch is already in progress, don't start another one
    if (fetchingRef.current) {
      console.log("A fetch operation is already in progress, skipping...");
      return;
    }
    
    fetchingRef.current = true;
    fetchAttemptsRef.current += 1;
    
    try {
      if (retry === 0) {
        setLoading(true);
        setError(null);
        // Reset the error notification flag when starting a new retry
        errorNotifiedRef.current = false;
      }
      
      console.log(`Chargement des clients... (tentative ${retry + 1}/${MAX_RETRIES + 1})`);
      
      // Check that the Supabase connection is established
      if (!supabase) {
        throw new Error("La connexion à la base de données n'est pas disponible");
      }
      
      // Set a safety timeout to ensure loading state doesn't get stuck
      // Reduced from 20s to 8s for faster feedback
      timeoutRef.current = setTimeout(() => {
        console.log("Fetch clients timeout reached, resetting loading state");
        setLoading(false);
        fetchingRef.current = false;
        timeoutRef.current = null;
        if (fetchAttemptsRef.current > 2 && !errorNotifiedRef.current) {
          setError("Délai de connexion dépassé, veuillez réessayer");
          errorNotifiedRef.current = true;
          if (showToast) {
            showErrorToast("Problème de connexion", "Le délai d'attente pour la connexion a été dépassé");
          }
        }
      }, 8000);
      
      // Fetch clients with a timeout - using the correct column name
      const fetchPromise = supabase
        .from('clients')
        .select('*')
        .order('date_creation', { ascending: false });
        
      // Manual timeout for the fetch operation
      const timeoutPromise = new Promise<{data: null, error: Error}>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Délai d'attente dépassé pour la requête"));
        }, 5000); // 5 second timeout for fetch
      });
      
      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
            
      // Clear the safety timeout since we got a response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const clientsError = response.error;
      const clientsData = response.data;

      if (clientsError) {
        console.error("Erreur lors de la récupération des clients:", clientsError);
        
        // If we haven't reached the maximum number of retries, try again
        if (retry < MAX_RETRIES) {
          console.log(`Nouvelle tentative dans ${RETRY_DELAY/1000} secondes...`);
          setTimeout(() => fetchClients(retry + 1, false), RETRY_DELAY);
          return;
        }
        
        // Otherwise, throw an error
        throw new Error(handleSupabaseError(clientsError));
      }

      if (!clientsData) {
        console.log("Aucune donnée reçue de la base de données");
        setClients([]);
        setLoading(false);
        fetchingRef.current = false;
        return;
      }

      console.log(`${clientsData.length} clients récupérés avec succès:`, clientsData);
      
      // Update the state with retrieved clients
      setClients(clientsData);
      fetchAttemptsRef.current = 0;
      
      // Update balances in background after loading clients
      if (clientsData.length > 0) {
        // Update balances in the background
        setTimeout(() => {
          updateClientBalances(clientsData).catch(err => {
            console.error("Error updating client balances:", err);
          });
        }, 200);
      }
      
      // Important: Reset loading state
      setLoading(false);
      
    } catch (error) {
      console.error("Erreur critique lors du chargement des clients:", error);
      
      if (retry < MAX_RETRIES) {
        console.log(`Nouvelle tentative dans ${RETRY_DELAY/1000} secondes...`);
        setTimeout(() => fetchClients(retry + 1, false), RETRY_DELAY);
        return;
      }
      
      setError(handleSupabaseError(error));
      
      // Show the error notification only if we haven't already shown one and if showToast is true
      if (showToast && !errorNotifiedRef.current) {
        showErrorToast("Erreur de connexion", error);
        errorNotifiedRef.current = true;
      }
      
      // Make sure loading state is reset
      setLoading(false);
    } finally {
      // Reset fetchingRef always in finally block
      fetchingRef.current = false;
    }
  }, [setClients, setLoading, setError]);

  return { fetchClients };
};
