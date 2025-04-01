
import { useState, useCallback, useEffect, useRef } from "react";
import { Client } from "@/features/clients/types";
import { ClientOperation, PublicClientData, TokenData } from "./types";
import { fetchAccessData, fetchClientDetails, fetchClientOperations } from "./fetchClientData";
import { showErrorToast } from "../utils/errorUtils";

export const usePublicClientData = (token: string | undefined): PublicClientData => {
  const [client, setClient] = useState<Client | null>(null);
  const [operations, setOperations] = useState<ClientOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0); // Track fetch attempts for debugging
  const [loadingTime, setLoadingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fetchingRef = useRef(false);
  const initialLoadCompletedRef = useRef(false);
  const dataFetchedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const maxRetryAttempts = 3; // Increased from 2 to 3
  const retryDelayMs = 2000; // Increased from 1500 to 2000
  const networkErrorCountRef = useRef(0);

  // Timer to track loading time
  useEffect(() => {
    if (isLoading && !error) {
      timerRef.current = setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isLoading, error]);

  const fetchClientData = useCallback(async () => {
    // Skip if no token or already fetching
    if (!token || fetchingRef.current) {
      console.log("Fetch skipped: No token or already fetching");
      return;
    }

    // Cancel any previous request
    if (abortControllerRef.current) {
      console.log("Aborting previous request...");
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    fetchingRef.current = true;
    const attemptCount = fetchCount + 1;
    setFetchCount(attemptCount);
    console.log(`Fetching client data (Attempt #${attemptCount}) with token: ${token}`);
    
    setIsLoading(true);
    setError(null);
    setLoadingTime(0);

    // Global timeout for the entire function - increased from 12 to 15 seconds
    const timeout = setTimeout(() => {
      if (fetchingRef.current && abortControllerRef.current) {
        console.log("Request timeout reached, aborting...");
        abortControllerRef.current.abort("timeout");
        setError("Le délai d'attente a été dépassé. Veuillez réessayer.");
        setIsLoading(false);
        fetchingRef.current = false;
      }
    }, 15000); 

    try {
      // Add a connection check before proceeding
      try {
        const online = navigator.onLine;
        if (!online) {
          throw new Error("Vous semblez être hors ligne. Vérifiez votre connexion internet.");
        }
      } catch (e) {
        console.log("Navigator.onLine check failed, continuing anyway");
      }

      // Check if request was already aborted
      if (signal.aborted) {
        throw new Error(`Opération annulée: ${signal.reason || "raison inconnue"}`);
      }

      // Step 1: Get client ID from token
      console.log(`Step 1: Fetching access data with token: ${token}`);
      const accessData: TokenData = await fetchAccessData(token);
      
      if (!accessData || !accessData.client_id) {
        const errorMsg = "Données d'accès invalides ou client non associé";
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log(`Step 2: Retrieved client ID ${accessData.client_id} from token`);
      
      // Check if request was aborted during token fetch
      if (signal.aborted) {
        throw new Error(`Opération annulée: ${signal.reason || "raison inconnue"}`);
      }
      
      // Step 2: Get client details
      const clientData = await fetchClientDetails(accessData.client_id);
      console.log(`Step 3: Retrieved client data:`, clientData);
      
      // Check if request was aborted during client fetch
      if (signal.aborted) {
        throw new Error(`Opération annulée: ${signal.reason || "raison inconnue"}`);
      }
      
      setClient(clientData);
      
      // Step 3: Get client operations using the token for authentication
      const fullName = `${clientData.prenom} ${clientData.nom}`;
      console.log(`Step 4: Fetching operations for ${fullName} with token for auth`);
      const operationsData = await fetchClientOperations(fullName, token);
      
      // Check if request was aborted during operations fetch
      if (signal.aborted) {
        throw new Error(`Opération annulée: ${signal.reason || "raison inconnue"}`);
      }
      
      setOperations(operationsData);
      
      console.log(`Step 5: Retrieved ${operationsData.length} client operations`);
      dataFetchedRef.current = true;
      initialLoadCompletedRef.current = true;
      networkErrorCountRef.current = 0; // Reset network error count on success
      setIsLoading(false);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message.includes("Opération annulée")) {
        console.log("Request was cancelled:", err.message);
        setError("La requête a été interrompue. Veuillez réessayer.");
      } else {
        console.error("Error in fetchClientData:", err);
        setClient(null);
        setOperations([]);
        const errorMessage = err.message || "Erreur lors de la récupération des données client";
        setError(errorMessage);
        
        // Track network errors for more aggressive retry handling
        const isNetworkError = err.message.includes("network") || 
                             err.message.includes("connexion") ||
                             err.message.includes("Failed to fetch") ||
                             err.message.includes("interrompue");
                             
        if (isNetworkError) {
          networkErrorCountRef.current++;
        }
        
        // Only show error toast for non-abort errors
        if (err.name !== 'AbortError' && !err.message.includes("Opération annulée")) {
          showErrorToast("Erreur d'accès", { message: errorMessage });
        }
        
        // Auto-retry for network errors with more aggressive retry for persistent issues
        if (isNetworkError && attemptCount <= maxRetryAttempts) {
          console.log(`Auto-retrying in ${retryDelayMs}ms (attempt ${attemptCount}/${maxRetryAttempts})...`);
          // Use progressively longer delays for repeated network errors
          const adjustedDelay = retryDelayMs * (networkErrorCountRef.current > 1 ? 2 : 1);
          
          setTimeout(() => {
            if (!dataFetchedRef.current) {
              fetchClientData();
            }
          }, adjustedDelay);
        }
      }
      setIsLoading(false);
    } finally {
      fetchingRef.current = false;
      clearTimeout(timeout);
    }
  }, [token, fetchCount]);

  const retryFetch = useCallback(() => {
    console.log("Manually retrying client data fetch with token:", token);
    dataFetchedRef.current = false; // Reset the data fetched flag to allow a new fetch
    
    // Make sure we're not already fetching
    if (fetchingRef.current) {
      console.log("Can't retry - already fetching");
      return;
    }
    
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort("manual retry");
      abortControllerRef.current = null;
    }
    
    // Reset error state before retrying
    setError(null);
    
    fetchClientData();
  }, [fetchClientData, token]);

  // Initial fetch on mount or token change - only run once
  useEffect(() => {
    if (token && !initialLoadCompletedRef.current) {
      console.log("Initial data load with token:", token);
      fetchClientData();
    }
    
    return () => {
      // Clean up any pending requests on unmount
      if (abortControllerRef.current) {
        console.log("Cleaning up - aborting any pending requests");
        abortControllerRef.current.abort("component unmounted");
        abortControllerRef.current = null;
      }
    };
  }, [token, fetchClientData]);

  return {
    client,
    operations,
    isLoading,
    error,
    loadingTime,
    fetchClientData,
    retryFetch
  };
};
