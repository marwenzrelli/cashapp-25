
import { useCallback, useRef, useState } from "react";
import { Client } from "@/features/clients/types";
import { ClientOperation, TokenData } from "./types";
import { fetchAccessData, fetchClientDetails, fetchClientOperations } from "./fetchClientData";
import { showErrorToast } from "../utils/errorUtils";
import { isNetworkError, isOnline, waitForNetwork } from "@/utils/network";

/**
 * Core hook for fetching client data with token
 */
export const useFetchClientData = (token: string | undefined) => {
  const [client, setClient] = useState<Client | null>(null);
  const [operations, setOperations] = useState<ClientOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  const [loadingTime, setLoadingTime] = useState(0);
  const fetchingRef = useRef(false);
  const dataFetchedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const networkErrorCountRef = useRef(0);
  
  const fetchClientData = useCallback(async () => {
    // Skip if no token or already fetching
    if (!token || fetchingRef.current) {
      console.log("Fetch skipped: No token or already fetching");
      return;
    }

    // Check if we're online before attempting fetch
    if (!isOnline()) {
      console.log("Device is offline. Waiting for connection...");
      setError("Vous êtes actuellement hors ligne. Connexion en attente...");
      
      // Wait for network to become available (with timeout)
      const networkAvailable = await waitForNetwork(20000);
      if (!networkAvailable) {
        setError("Impossible de récupérer une connexion internet. Veuillez vérifier votre réseau.");
        setIsLoading(false);
        return;
      }
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

    // Global timeout - 20 seconds (increased from 15)
    const timeout = setTimeout(() => {
      if (fetchingRef.current && abortControllerRef.current) {
        console.log("Request timeout reached, aborting...");
        abortControllerRef.current.abort("timeout");
        setError("Le délai d'attente a été dépassé. Veuillez réessayer.");
        setIsLoading(false);
        fetchingRef.current = false;
      }
    }, 20000); 

    try {
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
        if (isNetworkError(err)) {
          networkErrorCountRef.current++;
          console.log(`Network error detected (count: ${networkErrorCountRef.current})`);
        }
        
        // Only show error toast for non-abort errors
        if (err.name !== 'AbortError' && !err.message.includes("Opération annulée")) {
          showErrorToast("Erreur d'accès", { message: errorMessage });
        }
      }
      setIsLoading(false);
    } finally {
      fetchingRef.current = false;
      clearTimeout(timeout);
    }
  }, [token, fetchCount]);

  return {
    client,
    operations,
    isLoading,
    error,
    loadingTime,
    fetchingRef,
    dataFetchedRef,
    networkErrorCountRef,
    abortControllerRef,
    fetchClientData,
    setFetchCount,
    setLoadingTime
  };
};
