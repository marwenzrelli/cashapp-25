
import { useState, useCallback, useEffect } from "react";
import { Client } from "@/features/clients/types";
import { PublicClientData, ClientOperation } from "./types";
import { validateToken } from "./validation";
import { fetchAccessData, fetchClientDetails, fetchClientOperations } from "./fetchClientData";
import { toast } from "sonner";
import { showErrorToast } from "../utils/errorUtils";

export const usePublicClientData = (token: string | undefined): PublicClientData => {
  const [client, setClient] = useState<Client | null>(null);
  const [operations, setOperations] = useState<ClientOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const fetchClientData = useCallback(async () => {
    try {
      console.log("Fetching client data with token:", token);
      setIsLoading(true);
      setError(null); // Reset error state before new fetch

      // Validate token format
      const tokenValidation = validateToken(token);
      if (!tokenValidation.isValid) {
        console.error("Token validation failed:", tokenValidation.error);
        setError(tokenValidation.error);
        setIsLoading(false);
        
        showErrorToast("Erreur d'accès", { message: tokenValidation.error || "Token invalide" });
        return;
      }

      // Get client ID from token with additional validation
      const accessData = await fetchAccessData(token!);
      console.log("Access data retrieved:", accessData);
      
      if (!accessData || !accessData.client_id) {
        const errorMsg = "ID client manquant dans les données d'accès";
        console.error(errorMsg);
        setError(errorMsg);
        setIsLoading(false);
        
        showErrorToast("Erreur d'accès", { message: errorMsg });
        return;
      }
      
      // Fetch client data
      try {
        const clientData = await fetchClientDetails(accessData.client_id);
        console.log("Client data retrieved:", clientData);
        setClient(clientData);

        // Get client operations
        const clientFullName = `${clientData.prenom} ${clientData.nom}`;
        const clientOperations = await fetchClientOperations(clientFullName);
        setOperations(clientOperations);
      } catch (clientErr: any) {
        console.error("Error fetching client data:", clientErr);
        setError(clientErr.message || "Client introuvable dans notre système");
        showErrorToast("Client introuvable", { message: clientErr.message || "Client introuvable dans notre système" });
      }
      
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error in fetchClientData:", err);
      
      // Format user-friendly error message
      let errorMessage = "Une erreur est survenue lors de la récupération des données";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      // Show toast for the error
      showErrorToast("Erreur d'accès", { message: errorMessage });
      
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchClientData();
    }
  }, [token, retry, fetchClientData]);

  const retryFetch = useCallback(() => {
    setRetry(prev => prev + 1);
  }, []);

  return { 
    client, 
    operations, 
    isLoading, 
    error, 
    fetchClientData,
    retryFetch 
  };
};
