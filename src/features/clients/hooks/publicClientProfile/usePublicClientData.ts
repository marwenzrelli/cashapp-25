
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

  // Timer pour suivre le temps de chargement
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
    if (!token) {
      console.log("Cannot fetch data: Missing token");
      setError("Token d'accès manquant");
      setIsLoading(false);
      return;
    }

    // Éviter les requêtes en double
    if (fetchingRef.current) {
      console.log("Already fetching data, ignoring duplicate request");
      return;
    }

    fetchingRef.current = true;
    const attemptCount = fetchCount + 1;
    setFetchCount(attemptCount);
    console.log(`Fetching client data (Attempt #${attemptCount}) with token: ${token}`);
    
    setIsLoading(true);
    setError(null);
    setLoadingTime(0);

    try {
      // Step 1: Get client ID from token
      console.log(`Step 1: Fetching access data with token: ${token}`);
      const accessData: TokenData = await fetchAccessData(token);
      
      if (!accessData || !accessData.client_id) {
        const errorMsg = "Données d'accès invalides ou client non associé";
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log(`Step 2: Retrieved client ID ${accessData.client_id} from token`);
      
      // Step 2: Get client details
      const clientData = await fetchClientDetails(accessData.client_id);
      console.log(`Step 3: Retrieved client data:`, clientData);
      setClient(clientData);
      
      // Step 3: Get client operations
      const fullName = `${clientData.prenom} ${clientData.nom}`;
      console.log(`Step 4: Fetching operations for ${fullName}`);
      const operationsData = await fetchClientOperations(fullName);
      setOperations(operationsData);
      
      console.log(`Step 5: Retrieved ${operationsData.length} client operations`);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error in fetchClientData:", err);
      setClient(null);
      setOperations([]);
      const errorMessage = err.message || "Erreur lors de la récupération des données client";
      setError(errorMessage);
      showErrorToast("Erreur d'accès", { message: errorMessage });
      setIsLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  }, [token, fetchCount]);

  const retryFetch = useCallback(() => {
    console.log("Retrying client data fetch with token:", token);
    fetchClientData();
  }, [fetchClientData]);

  // Initial fetch on mount or token change
  useEffect(() => {
    if (token) {
      console.log("Token changed or component mounted, fetching client data");
      fetchClientData();
    }
  }, [token]);

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
