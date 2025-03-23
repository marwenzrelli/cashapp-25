
import { useState, useCallback, useRef } from "react";
import { Client } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { showErrorToast, handleSupabaseError } from "../utils/errorUtils";
import { updateClientBalances } from "./utils/balanceUtils";
import { FETCH_CONFIG, withTimeout, SupabaseQueryResult } from "./utils/fetchConfig";

export const useFetchClients = (
  setClients: React.Dispatch<React.SetStateAction<Client[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  // Use references to track state between renders
  const errorNotifiedRef = useRef(false);
  const fetchingRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetriesRef = useRef<number>(FETCH_CONFIG.MAX_RETRIES);

  // Optimized fetch function
  const fetchClients = useCallback(async (retry = 0, showToast = true) => {
    // Prevent fetch if another is in progress 
    const now = Date.now();
    if (fetchingRef.current) {
      console.log("Fetch skipped: already fetching");
      return Promise.resolve();
    }
    
    // If throttling too many requests, allow after 2 seconds regardless
    if (now - lastFetchTimeRef.current < 300 && retry === 0 && (now - lastFetchTimeRef.current) < 2000) {
      console.log("Fetch skipped: too soon");
      return Promise.resolve();
    }
    
    // Cancel any existing fetch operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Cancel any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    fetchingRef.current = true;
    lastFetchTimeRef.current = now;
    
    try {
      if (retry === 0) {
        setLoading(true);
        setError(null);
        errorNotifiedRef.current = false;
      }
      
      console.log(`Loading clients... (attempt ${retry + 1}/${maxRetriesRef.current + 1})`);
      
      // Check for Supabase connection
      if (!supabase) {
        throw new Error("Database connection unavailable");
      }
      
      // Build the query but don't execute it yet
      const clientsQuery = supabase
        .from('clients')
        .select('*')
        .order('date_creation', { ascending: false });
      
      // Execute the query with explicit typing - withTimeout will now handle the query builder properly
      const response = await withTimeout<Client[]>(clientsQuery, FETCH_CONFIG.TIMEOUT + (retry * 1000));

      // Properly check for error
      if (response.error) {
        console.error("Error fetching clients:", response.error);
        
        if (retry < maxRetriesRef.current) {
          console.log(`Retrying in ${FETCH_CONFIG.RETRY_DELAY/1000} seconds...`);
          
          // Clear the fetching flag to allow retry
          fetchingRef.current = false;
          
          // Increasing delay for each retry
          setTimeout(() => fetchClients(retry + 1, false), FETCH_CONFIG.RETRY_DELAY + (retry * 500));
          return Promise.resolve();
        }
        
        throw response.error;
      }

      // Properly check for missing data
      if (!response.data || !Array.isArray(response.data)) {
        console.log("No valid data received from database");
        setClients([]);
        return Promise.resolve();
      }

      console.log(`${response.data.length} clients retrieved successfully`);
      
      // Update state with retrieved clients
      setClients(response.data);
      
      // Update balances in background after loading clients
      if (response.data.length > 0) {
        // Process only the most recent clients immediately, defer others
        setTimeout(() => {
          updateClientBalances(response.data, setClients);
        }, 100);
      }
      
      return Promise.resolve();
      
    } catch (error) {
      console.error("Critical error loading clients:", error);
      
      if (retry < maxRetriesRef.current) {
        console.log(`Retrying in ${FETCH_CONFIG.RETRY_DELAY/1000} seconds...`);
        
        // Clear the fetching flag to allow retry
        fetchingRef.current = false;
        
        setTimeout(() => fetchClients(retry + 1, false), FETCH_CONFIG.RETRY_DELAY + (retry * 500));
        return Promise.resolve();
      }
      
      setError(handleSupabaseError(error));
      
      // Show error toast only once
      if (showToast && !errorNotifiedRef.current) {
        showErrorToast("Connection error", error);
        errorNotifiedRef.current = true;
      }
      
      return Promise.resolve();
      
    } finally {
      // Delay clearing the loading state to prevent flicker
      debounceTimerRef.current = setTimeout(() => {
        if (retry === 0 || retry >= maxRetriesRef.current) {
          setLoading(false);
        }
        fetchingRef.current = false;
        abortControllerRef.current = null;
        debounceTimerRef.current = null;
      }, 300); // Debounce for 300ms
    }
  }, [setClients, setLoading, setError]);

  return { fetchClients };
};
