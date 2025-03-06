
import { useState, useCallback } from "react";
import { Client } from "@/features/clients/types";
import { PublicClientData, ClientOperation } from "./types";
import { validateToken } from "./validation";
import { fetchAccessData, fetchClientDetails, fetchClientOperations } from "./fetchClientData";

export const usePublicClientData = (token: string | undefined): PublicClientData => {
  const [client, setClient] = useState<Client | null>(null);
  const [operations, setOperations] = useState<ClientOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientData = useCallback(async () => {
    try {
      console.log("Fetching client data with token:", token);
      setIsLoading(true);
      setError(null); // Reset error state before new fetch

      // Validate token format
      const tokenValidation = validateToken(token);
      if (!tokenValidation.isValid) {
        setError(tokenValidation.error);
        setIsLoading(false);
        return;
      }

      // Get client ID from token with additional validation
      const accessData = await fetchAccessData(token!);
      
      // Fetch client data
      const clientData = await fetchClientDetails(accessData.client_id);
      setClient(clientData);

      // Get client operations
      const clientFullName = `${clientData.prenom} ${clientData.nom}`;
      const clientOperations = await fetchClientOperations(clientFullName);
      setOperations(clientOperations);
      
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error in fetchClientData:", err);
      setError(err.message || "Une erreur est survenue lors de la récupération des données");
      setIsLoading(false);
    }
  }, [token]);

  return { client, operations, isLoading, error, fetchClientData };
};
