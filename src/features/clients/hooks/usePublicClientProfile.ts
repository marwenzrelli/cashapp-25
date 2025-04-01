
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
  const autoRetryEnabledRef = useRef(true);
  
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

  // Refresh data function that respects auto-retry settings
  const refreshData = useCallback(() => {
    console.log("Refreshing client data due to realtime update");
    if (token && tokenValidation.isValid && !isLoading && autoRetryEnabledRef.current) {
      fetchClientData();
    }
  }, [fetchClientData, token, isLoading, tokenValidation.isValid]);

  // Pass clientId and refreshData to useRealtimeSubscriptions
  useRealtimeSubscriptions(clientId, refreshData);
  
  // Network error retry logic
  useEffect(() => {
    // Handle network connectivity changes
    const handleOnline = () => {
      console.log("Network connection restored, attempting auto-retry");
      connectionErrorRef.current = 0;
      if (error && (error.includes("connexion") || error.includes("interrompue") || error.includes("réseau"))) {
        if (autoRetryEnabledRef.current) {
          toast.info("Connexion internet rétablie", {
            description: "Tentative de récupération des données..."
          });
          setTimeout(() => {
            retryFetch();
          }, 1000);
        }
      }
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [error, retryFetch]);
  
  // Auto retry for specific types of errors with backoff
  useEffect(() => {
    if (error && !isLoading && connectionErrorRef.current < maxConnectionRetries && autoRetryEnabledRef.current) {
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

  // Disable auto-retry after too many attempts
  useEffect(() => {
    if (connectionErrorRef.current >= maxConnectionRetries) {
      if (autoRetryEnabledRef.current) {
        console.log("Maximum auto-retry attempts reached, disabling auto-retry");
        autoRetryEnabledRef.current = false;
        
        // Show toast to inform user
        toast.error("Problème de connexion persistant", {
          description: "Veuillez réessayer manuellement ou revenir plus tard."
        });
        
        // Re-enable after 30 seconds
        setTimeout(() => {
          console.log("Re-enabling auto-retry after cooldown");
          autoRetryEnabledRef.current = true;
          connectionErrorRef.current = 0;
        }, 30000);
      }
    }
  }, [connectionErrorRef.current]);
  
  // Manual retry function that users can call
  const manualRetryFetch = useCallback(() => {
    // Reset error tracking on manual retry
    connectionErrorRef.current = 0;
    errorNotifiedRef.current = false;
    autoRetryEnabledRef.current = true;
    
    // Perform the retry
    return retryFetch();
  }, [retryFetch]);
  
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
    retryFetch: manualRetryFetch
  };
};
