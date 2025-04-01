import { useEffect, useCallback, useRef } from "react";
import { usePublicClientData } from "./publicClientProfile/usePublicClientData";
import { useRealtimeSubscriptions } from "./publicClientProfile/useRealtimeSubscriptions";
import { validateToken } from "./publicClientProfile/validation";
import { checkClientOperations } from "./utils/checkClientOperations";
import { toast } from "sonner";
import { isOnline } from "@/utils/network";

export const usePublicClientProfile = (token: string | undefined) => {
  // Validate token format before proceeding
  const tokenValidation = token ? validateToken(token) : { isValid: false, error: "Token d'accès manquant" };
  const verificationCompletedRef = useRef(false);
  const operationsCheckedRef = useRef(false);
  const errorNotifiedRef = useRef(false);
  const connectionErrorRef = useRef(0);
  const maxConnectionRetries = 5; // Increased from 3
  const autoRetryEnabledRef = useRef(true);
  
  // Use our refactored hook for client data
  const { 
    client, 
    operations, 
    isLoading, 
    error, 
    loadingTime,
    isConnected,
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
  
  // Network error retry logic with improved controls
  useEffect(() => {
    // Handle network connectivity changes
    const handleOnline = () => {
      console.log("Network connection restored, attempting auto-retry");
      connectionErrorRef.current = 0;
      
      if (error && autoRetryEnabledRef.current) {
        toast.info("Connexion internet rétablie", {
          description: "Tentative de récupération des données..."
        });
        
        // Small delay to ensure connection is stable
        setTimeout(() => {
          retryFetch();
        }, 1500);
      }
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [error, retryFetch]);
  
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
        
        // Re-enable after 45 seconds (increased from 30)
        setTimeout(() => {
          console.log("Re-enabling auto-retry after cooldown");
          autoRetryEnabledRef.current = true;
          connectionErrorRef.current = 0;
        }, 45000);
      }
    }
  }, [connectionErrorRef.current]);
  
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
    isConnected,
    fetchClientData,
    retryFetch: manualRetryFetch
  };
};
