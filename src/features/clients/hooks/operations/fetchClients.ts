
import { useState, useCallback, useRef } from "react";
import { Client } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { showErrorToast, handleSupabaseError } from "../utils/errorUtils";
import { updateClientBalances } from "./utils/balanceUtils";
import { FETCH_CONFIG, withTimeout } from "./utils/fetchConfig";

export const useFetchClients = (
  setClients: React.Dispatch<React.SetStateAction<Client[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  // Use references to track state between renders
  const errorNotifiedRef = useRef(false);
  const fetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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
      
      console.log(`Loading clients... (attempt ${retry + 1}/${FETCH_CONFIG.MAX_RETRIES + 1})`);
      
      // Check for Supabase connection
      if (!supabase) {
        throw new Error("Database connection unavailable");
      }
      
      // Fetch with timeout
      const fetchClientsQuery = supabase
        .from('clients')
        .select('*')
        .order('date_creation', { ascending: false });
      
      // Execute the query with timeout
      const result = await withTimeout(fetchClientsQuery);
      const { data: clientsData, error: clientsError } = result;

      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
        
        if (retry < FETCH_CONFIG.MAX_RETRIES) {
          console.log(`Retrying in ${FETCH_CONFIG.RETRY_DELAY/1000} seconds...`);
          setTimeout(() => fetchClients(retry + 1, false), FETCH_CONFIG.RETRY_DELAY);
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
          updateClientBalances(clientsData, setClients);
        }, 100);
      }
      
    } catch (error) {
      console.error("Critical error loading clients:", error);
      
      if (retry < FETCH_CONFIG.MAX_RETRIES) {
        console.log(`Retrying in ${FETCH_CONFIG.RETRY_DELAY/1000} seconds...`);
        setTimeout(() => fetchClients(retry + 1, false), FETCH_CONFIG.RETRY_DELAY);
        return;
      }
      
      setError(handleSupabaseError(error));
      
      // Show error toast only once
      if (showToast && !errorNotifiedRef.current) {
        showErrorToast("Connection error", error);
        errorNotifiedRef.current = true;
      }
    } finally {
      if (retry === 0 || retry === FETCH_CONFIG.MAX_RETRIES) {
        setLoading(false);
      }
      fetchingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [setClients, setLoading, setError]);

  return { fetchClients };
};
