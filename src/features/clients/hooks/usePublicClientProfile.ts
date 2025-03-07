
import { useEffect, useCallback, useRef } from "react";
import { usePublicClientData } from "./publicClientProfile/usePublicClientData";
import { useRealtimeSubscriptions } from "./publicClientProfile/useRealtimeSubscriptions";
import { validateToken } from "./publicClientProfile/validation";
import { checkClientOperations } from "./utils/checkClientOperations";

export const usePublicClientProfile = (token: string | undefined) => {
  // Validate token format before proceeding
  const tokenValidation = token ? validateToken(token) : { isValid: false, error: "Token d'accès manquant" };
  const verificationCompletedRef = useRef(false);
  const operationsCheckedRef = useRef(false);
  
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
    if (token && !isLoading) {
      fetchClientData();
    }
  }, [fetchClientData, token, isLoading]);

  // Pass clientId and refreshData to useRealtimeSubscriptions
  useRealtimeSubscriptions(clientId, refreshData);
  
  // Verify operations if we have client but no operations - run only once
  useEffect(() => {
    const verifyOperationsExist = async () => {
      if (client && operations.length === 0 && !isLoading && !error && token && 
          !verificationCompletedRef.current && !operationsCheckedRef.current) {
        console.log("Client loaded but no operations found. Running verification check...");
        verificationCompletedRef.current = true;
        operationsCheckedRef.current = true;
        
        const clientFullName = `${client.prenom} ${client.nom}`.trim();
        
        // Check database operations with token authentication
        const opsCheck = await checkClientOperations(clientFullName, client.id, token);
        
        if (opsCheck.totalCount > 0) {
          console.log(`Found ${opsCheck.totalCount} operations in database, but none retrieved. Retrying fetch...`);
          // If operations exist but weren't retrieved, retry the fetch
          retryFetch();
        } else {
          console.log("No operations found for this client in the database.");
        }
      }
    };
    
    // Only check if we haven't already
    if (!operationsCheckedRef.current) {
      verifyOperationsExist();
    }
  }, [client, operations, isLoading, error, token, retryFetch]);
  
  // Log detailed information for debugging - only when state changes
  useEffect(() => {
    console.log("PublicClientProfile hook state:", {
      token: token ? `${token.substring(0, 8)}...` : undefined,
      tokenValid: tokenValidation.isValid,
      tokenError: tokenValidation.error,
      clientId,
      hasClient: !!client,
      hasOperations: operations?.length > 0,
      isLoading,
      loadingTime,
      error
    });
  }, [token, tokenValidation, client, clientId, operations, isLoading, loadingTime, error]);

  return {
    client,
    operations: operations || [],
    isLoading,
    error: tokenValidation.isValid ? error : tokenValidation.error,
    loadingTime,
    fetchClientData,
    retryFetch
  };
};
