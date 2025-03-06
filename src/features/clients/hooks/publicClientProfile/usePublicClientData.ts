
import { useState, useCallback } from "react";
import { Client } from "@/features/clients/types";
import { ClientOperation, PublicClientData, TokenData } from "./types";
import { fetchAccessData, fetchClientDetails, fetchClientOperations } from "./fetchClientData";
import { showErrorToast } from "../utils/errorUtils";

export const usePublicClientData = (token: string | undefined): PublicClientData => {
  const [client, setClient] = useState<Client | null>(null);
  const [operations, setOperations] = useState<ClientOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientData = useCallback(async () => {
    if (!token) {
      setError("Token d'accès manquant");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching data with token:", token);
      
      // Step 1: Get client ID from token
      const accessData: TokenData = await fetchAccessData(token);
      
      if (!accessData || !accessData.client_id) {
        throw new Error("Données d'accès invalides ou client non associé");
      }
      
      console.log("Retrieved client ID from token:", accessData.client_id);
      
      // Step 2: Get client details
      const clientData = await fetchClientDetails(accessData.client_id);
      setClient(clientData);
      
      console.log("Retrieved client data:", clientData);
      
      // Step 3: Get client operations
      const fullName = `${clientData.prenom} ${clientData.nom}`;
      const operationsData = await fetchClientOperations(fullName);
      setOperations(operationsData);
      
      console.log("Retrieved client operations:", operationsData.length);
      
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error in fetchClientData:", err);
      setClient(null);
      setOperations([]);
      setError(err.message || "Erreur lors de la récupération des données client");
      showErrorToast("Erreur d'accès", { message: err.message });
      setIsLoading(false);
    }
  }, [token]);

  const retryFetch = useCallback(() => {
    console.log("Retrying client data fetch with token:", token);
    fetchClientData();
  }, [fetchClientData]);

  // Initial data fetch
  useCallback(() => {
    fetchClientData();
  }, [fetchClientData]);

  return {
    client,
    operations,
    isLoading,
    error,
    fetchClientData,
    retryFetch
  };
};
