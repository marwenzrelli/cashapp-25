import { useState, useCallback, useRef } from "react";
import { Client } from "../../../types";
import { supabase } from "@/integrations/supabase/client";
import { fetchClientsData } from "./fetchHandler";
import { handleFetchError } from "./errorHandler";
import { updateClientState } from "./stateUpdater";
import { MAX_RETRIES, RETRY_DELAY, SAFETY_TIMEOUT } from "./constants";
import { showErrorToast } from "../../utils/errorUtils";

/**
 * Hook that manages the fetch operation for clients
 */
export const useFetchOperation = (
  setClients: React.Dispatch<React.SetStateAction<Client[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  // Use a reference to track if an error notification has already been shown
  const errorNotifiedRef = useRef(false);
  // Use a reference to track ongoing operations
  const fetchingRef = useRef(false);
  // Use a reference to track timeout
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Use a counter for fetch attempts
  const fetchAttemptsRef = useRef(0);

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
      }, SAFETY_TIMEOUT);
      
      // Fetch the clients data
      const { data: clientsData, error: clientsError } = await fetchClientsData();
            
      // Clear the safety timeout since we got a response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

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

      // Update state with the fetched clients
      updateClientState(clientsData, setClients, setLoading, fetchAttemptsRef);
      
    } catch (error) {
      const { shouldRetry, errorMessage, errorNotified } = handleFetchError(
        error, 
        retry, 
        MAX_RETRIES, 
        errorNotifiedRef.current,
        showToast
      );
      
      errorNotifiedRef.current = errorNotified;
      
      if (shouldRetry) {
        console.log(`Nouvelle tentative dans ${RETRY_DELAY/1000} secondes...`);
        setTimeout(() => fetchClients(retry + 1, false), RETRY_DELAY);
        return;
      }
      
      setError(errorMessage);
      
      // Make sure loading state is reset
      setLoading(false);
    } finally {
      // Reset fetchingRef always in finally block
      fetchingRef.current = false;
    }
  }, [setClients, setLoading, setError]);

  return { fetchClients };
};
