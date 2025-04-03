
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
    // Skip if no token or already fetching or already fetched
    if (!token || fetchingRef.current || (dataFetchedRef.current && client)) {
      return;
    }

    fetchingRef.current = true;
    const attemptCount = fetchCount + 1;
    setFetchCount(attemptCount);
    console.log(`Récupération des données client (Tentative #${attemptCount}) avec le token: ${token.substring(0, 8)}...`);
    
    setIsLoading(true);
    setError(null);
    setLoadingTime(0);

    // Ajouter un timeout global pour toute la fonction
    const globalTimeout = setTimeout(() => {
      if (fetchingRef.current) {
        setError("Le délai d'attente a été dépassé. Veuillez réessayer.");
        setIsLoading(false);
        fetchingRef.current = false;
      }
    }, 15000); // 15 secondes pour l'ensemble du processus

    try {
      // Step 1: Get client ID from token
      console.log(`Étape 1: Récupération des données d'accès avec le token: ${token.substring(0, 8)}...`);
      const accessData: TokenData = await fetchAccessData(token);
      
      if (!accessData || !accessData.client_id) {
        const errorMsg = "Données d'accès invalides ou client non associé";
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log(`Étape 2: ID client ${accessData.client_id} récupéré depuis le token`);
      
      // Step 2: Get client details
      const clientData = await fetchClientDetails(accessData.client_id);
      console.log(`Étape 3: Données client récupérées:`, clientData);
      
      setClient(clientData);
      
      // Step 3: Get client operations using the token for authentication
      const fullName = `${clientData.prenom} ${clientData.nom}`;
      console.log(`Étape 4: Récupération des opérations pour ${fullName} avec le token pour authentification`);
      
      // Wrap operations fetch in a separate try/catch to still show client data if operations fail
      try {
        const operationsData = await fetchClientOperations(fullName, token);
        
        setOperations(operationsData);
        console.log(`Étape 5: ${operationsData.length} opérations client récupérées`);
      } catch (operationsErr: any) {
        // Log the error but still consider client data fetch successful
        console.warn("Erreur lors de la récupération des opérations:", operationsErr);
        setOperations([]);
      }
      
      dataFetchedRef.current = true;
      setIsLoading(false);
      initialLoadCompletedRef.current = true;
    } catch (err: any) {
      console.error("Error in fetchClientData:", err);
      setClient(null);
      setOperations([]);
      const errorMessage = err.message || "Erreur lors de la récupération des données client";
      setError(errorMessage);
      showErrorToast("Erreur d'accès", errorMessage);
      setIsLoading(false);
    } finally {
      fetchingRef.current = false;
      clearTimeout(globalTimeout);
    }
  }, [token, fetchCount, client]);

  const retryFetch = useCallback(() => {
    console.log("Nouvelle tentative de récupération des données client avec le token:", token?.substring(0, 8));
    dataFetchedRef.current = false; // Reset the data fetched flag to allow a new fetch
    fetchClientData();
  }, [fetchClientData, token]);

  // Initial fetch on mount or token change - only run once
  useEffect(() => {
    if (token && !initialLoadCompletedRef.current) {
      console.log("Chargement initial des données avec le token:", token.substring(0, 8));
      fetchClientData();
    }
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
