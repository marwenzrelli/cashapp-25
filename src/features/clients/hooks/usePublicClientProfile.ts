
import { useEffect, useCallback, useRef } from "react";
import { usePublicClientData } from "./publicClientProfile/usePublicClientData";
import { useRealtimeSubscriptions } from "./publicClientProfile/useRealtimeSubscriptions";
import { validateToken } from "./publicClientProfile/validation";
import { checkClientOperations } from "./utils/checkClientOperations";
import { toast } from "sonner";

export const usePublicClientProfile = (token: string | undefined) => {
  // Validate token format before proceeding
  const tokenValidation = token ? validateToken(token) : { isValid: false, error: "Token d'accès manquant" };
  const verificationCompletedRef = useRef(false);
  const operationsCheckedRef = useRef(false);
  const errorNotifiedRef = useRef(false);
  const connectionErrorRef = useRef(0);
  const maxConnectionRetries = 3;
  
  const { 
    client, 
    operations, 
    isLoading, 
    error, 
    loadingTime,
    fetchClientData,
    retryFetch 
  } = usePublicClientData(tokenValidation.isValid ? token : undefined);

  // Extract the client ID from the client object for subscriptions
  const clientId = client?.id;

  // Set up realtime subscriptions - but limit refreshes
  const refreshData = useCallback(() => {
    console.log("Refreshing client data due to realtime update");
    if (token && tokenValidation.isValid && !isLoading) {
      fetchClientData();
    }
  }, [fetchClientData, token, isLoading, tokenValidation.isValid]);

  // Pass clientId and refreshData to useRealtimeSubscriptions
  useRealtimeSubscriptions(clientId, refreshData);
  
  // Network error retry logic
  useEffect(() => {
    // Handle network connectivity changes
    const handleOnline = () => {
      console.log("Network connection restored, retrying fetch");
      connectionErrorRef.current = 0;
      if (error && (error.includes("connexion") || error.includes("interrompue") || error.includes("réseau"))) {
        toast.info("Connexion internet rétablie", {
          description: "Tentative de récupération des données..."
        });
        setTimeout(() => {
          retryFetch();
        }, 1000);
      }
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [error, retryFetch]);
  
  // Auto retry for specific types of errors
  useEffect(() => {
    if (error && !isLoading && connectionErrorRef.current < maxConnectionRetries) {
      // Only auto-retry for specific connection errors
      if (error.includes("interrompue") || error.includes("réseau") || error.includes("connexion")) {
        connectionErrorRef.current++;
        const retryDelay = 3000 * connectionErrorRef.current; // Increasing delay with each retry
        
        console.log(`Auto-retrying connection error in ${retryDelay}ms (attempt ${connectionErrorRef.current}/${maxConnectionRetries})`);
        
        const timer = setTimeout(() => {
          // Check if we're online before attempting retry
          if (navigator.onLine !== false) {
            toast.info("Tentative de reconnexion", {
              description: `Tentative ${connectionErrorRef.current}/${maxConnectionRetries}`
            });
            retryFetch();
          } else {
            console.log("Skipping auto-retry because device is offline");
          }
        }, retryDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [error, isLoading, retryFetch]);
  
  // Verify operations if we have client but no operations - run only once
  useEffect(() => {
    const verifyOperationsExist = async () => {
      if (client && operations.length === 0 && !isLoading && !error && token && 
          !verificationCompletedRef.current && !operationsCheckedRef.current) {
        console.log("Client loaded but no operations found. Running verification check...");
        verificationCompletedRef.current = true;
        operationsCheckedRef.current = true;
        
        const clientFullName = `${client.prenom} ${client.nom}`.trim();
        
        try {
          // Check database operations with token authentication
          const opsCheck = await checkClientOperations(clientFullName, client.id, token);
          
          if (opsCheck.totalCount > 0) {
            console.log(`Found ${opsCheck.totalCount} operations in database, but none retrieved. Retrying fetch...`);
            // If operations exist but weren't retrieved, retry the fetch
            retryFetch();
          } else {
            console.log("No operations found for this client in the database.");
          }
        } catch (err) {
          console.error("Error during operations verification:", err);
          // Don't retry here as it might cause a loop
        }
      }
    };
    
    // Only check if we haven't already
    if (!operationsCheckedRef.current) {
      verifyOperationsExist();
    }
  }, [client, operations, isLoading, error, token, retryFetch]);

  // Show toast for serious errors
  useEffect(() => {
    if (error && !isLoading && !errorNotifiedRef.current) {
      if (error.includes("Token") || error.includes("accès") || error.includes("invalide") || error.includes("expiré")) {
        // Don't show toast for expected errors like invalid token, these will be displayed in the UI
      } else if (error.includes("délai") || error.includes("interrompue") || error.includes("connexion")) {
        // For network-related errors, show toast once
        toast.error("Problème de connexion", {
          description: "Problème lors de la récupération des données du client."
        });
        errorNotifiedRef.current = true;
      }
    }
  }, [error, isLoading]);
  
  // Return appropriate error depending on validation result
  const finalError = tokenValidation.isValid ? error : tokenValidation.error;

  // Reset error notification ref when error or loading state changes
  useEffect(() => {
    if (!error || isLoading) {
      errorNotifiedRef.current = false;
    }
  }, [error, isLoading]);

  return {
    client,
    operations: operations || [],
    isLoading,
    error: finalError,
    loadingTime,
    fetchClientData,
    retryFetch
  };
};
