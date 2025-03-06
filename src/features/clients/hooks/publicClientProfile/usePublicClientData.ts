
import { useState, useCallback, useEffect } from "react";
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

  const fetchClientData = useCallback(async () => {
    if (!token) {
      console.log("Cannot fetch data: Missing token");
      setError("Token d'accès manquant");
      setIsLoading(false);
      return;
    }

    const attemptCount = fetchCount + 1;
    setFetchCount(attemptCount);
    console.log(`Fetching client data (Attempt #${attemptCount}) with token: ${token}`);
    
    setIsLoading(true);
    setError(null);

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
    }
  }, [token, fetchCount]);

  const retryFetch = useCallback(() => {
    console.log("Retrying client data fetch with token:", token);
    fetchClientData();
  }, [fetchClientData]);

  // We'll remove the automatic fetch on token change to avoid race conditions
  // The parent component will explicitly call fetchClientData after validation

  return {
    client,
    operations,
    isLoading,
    error,
    fetchClientData,
    retryFetch
  };
};
