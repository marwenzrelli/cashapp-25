
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
  // Optimized configuration constants
  const MAX_RETRIES = 1; // Reduced from 2
  const RETRY_DELAY = 1000; // Reduced from 2000
  
  // Use references to track state between renders
  const errorNotifiedRef = useRef(false);
  const fetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Optimized function to update client balances
  const updateClientBalances = async (clientsList: Client[]) => {
    if (!supabase || !clientsList.length) return;
    
    try {
      // Process only 10 most recent clients for immediate balance updates
      const recentClients = [...clientsList]
        .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime())
        .slice(0, 10);
      
      // Process all clients at once
      await Promise.all(recentClients.map(async (client) => {
        try {
          const clientName = `${client.prenom} ${client.nom}`;
          
          // Fetch deposits and withdrawals in parallel with timeout
          const fetchPromise = Promise.all([
            supabase.from('deposits').select('amount').eq('client_name', clientName),
            supabase.from('withdrawals').select('amount').eq('client_name', clientName)
          ]);
          
          // Add timeout to prevent hanging requests
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout")), 3000)
          );
          
          const [depositsResult, withdrawalsResult] = await Promise.race([
            fetchPromise,
            timeoutPromise
          ]) as any;
          
          const deposits = depositsResult.data || [];
          const withdrawals = withdrawalsResult.data || [];
          
          const depositsTotal = deposits.reduce((sum, d) => sum + Number(d.amount), 0);
          const withdrawalsTotal = withdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
          const balance = depositsTotal - withdrawalsTotal;

          // Only update if balance has changed
          if (client.solde !== balance) {
            // Update database silently - don't throw on error
            supabase
              .from('clients')
              .update({ solde: balance || 0 })
              .eq('id', client.id)
              .then(({ error }) => {
                if (error) {
                  console.warn(`Could not update balance for ${clientName}:`, error);
                }
              });

            // Update local state immediately
            setClients(prevClients => 
              prevClients.map(c => 
                c.id === client.id ? { ...c, solde: balance || 0 } : c
              )
            );
          }
        } catch (error) {
          // Catch errors for individual clients without stopping the process
          console.warn(`Error for client ${client.id}:`, error);
        }
      }));
      
      // Schedule updates for remaining clients
      if (clientsList.length > 10) {
        setTimeout(() => {
          const remainingClients = [...clientsList]
            .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime())
            .slice(10);
          updateClientBalances(remainingClients);
        }, 100);
      }
    } catch (error) {
      console.warn("Error updating balances:", error);
    }
  };

  // Optimized fetch function
  const fetchClients = useCallback(async (retry = 0, showToast = true) => {
    // Cancel any existing fetch operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    // If a fetch is already in progress, don't start another
    if (fetchingRef.current) {
      return;
    }
    
    fetchingRef.current = true;
    
    try {
      if (retry === 0) {
        setLoading(true);
        setError(null);
        errorNotifiedRef.current = false;
      }
      
      console.log(`Loading clients... (attempt ${retry + 1}/${MAX_RETRIES + 1})`);
      
      // Check for Supabase connection
      if (!supabase) {
        throw new Error("Database connection unavailable");
      }
      
      // Fetch with timeout
      const fetchWithTimeout = async () => {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Request timeout")), 5000); // Reduced from 8000
        });
        
        const fetchPromise = supabase
          .from('clients')
          .select('*')
          .order('date_creation', { ascending: false });
        
        return Promise.race([fetchPromise, timeoutPromise]);
      };
      
      const { data: clientsData, error: clientsError } = await fetchWithTimeout() as any;

      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
        
        if (retry < MAX_RETRIES) {
          console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
          setTimeout(() => fetchClients(retry + 1, false), RETRY_DELAY);
          return;
        }
        
        throw new Error(handleSupabaseError(clientsError));
      }

      if (!clientsData) {
        console.log("No data received from database");
        setClients([]);
        return;
      }

      console.log(`${clientsData.length} clients retrieved successfully`);
      
      // Update state with retrieved clients
      setClients(clientsData);
      
      // Update balances in background after loading clients
      if (clientsData.length > 0) {
        // Process only the most recent clients immediately, defer others
        setTimeout(() => {
          updateClientBalances(clientsData);
        }, 100);
      }
      
    } catch (error) {
      console.error("Critical error loading clients:", error);
      
      if (retry < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
        setTimeout(() => fetchClients(retry + 1, false), RETRY_DELAY);
        return;
      }
      
      setError(handleSupabaseError(error));
      
      // Show error toast only once
      if (showToast && !errorNotifiedRef.current) {
        showErrorToast("Connection error", error);
        errorNotifiedRef.current = true;
      }
    } finally {
      if (retry === 0 || retry === MAX_RETRIES) {
        setLoading(false);
      }
      fetchingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [setClients, setLoading, setError]);

  return { fetchClients };
};
