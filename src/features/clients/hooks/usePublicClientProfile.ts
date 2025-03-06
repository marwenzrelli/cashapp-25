
import { useEffect, useCallback } from "react";
import { usePublicClientData } from "./publicClientProfile/usePublicClientData";
import { useRealtimeSubscriptions } from "./publicClientProfile/useRealtimeSubscriptions";
import { validateToken } from "./publicClientProfile/validation";

export const usePublicClientProfile = (token: string | undefined) => {
  // Validate token format before proceeding
  const tokenValidation = token ? validateToken(token) : { isValid: false, error: "Token d'accès manquant" };
  
  const { 
    client, 
    operations, 
    isLoading, 
    error, 
    fetchClientData,
    retryFetch 
  } = usePublicClientData(tokenValidation.isValid ? token : undefined);

  // Extract the client ID from the client object for subscriptions
  const clientId = client?.id;

  // Set up realtime subscriptions
  const refreshData = useCallback(() => {
    console.log("Refreshing client data due to realtime update");
    if (token) {
      fetchClientData();
    }
  }, [fetchClientData, token]);

  // Pass clientId and refreshData to useRealtimeSubscriptions
  useRealtimeSubscriptions(clientId, refreshData);
  
  // Log detailed information for debugging
  useEffect(() => {
    console.log("PublicClientProfile hook state:", {
      token: token ? `${token.substring(0, 8)}...` : undefined,
      tokenValid: tokenValidation.isValid,
      tokenError: tokenValidation.error,
      clientId,
      hasClient: !!client,
      hasOperations: operations?.length > 0,
      isLoading,
      error
    });
  }, [token, tokenValidation, client, clientId, operations, isLoading, error]);

  return {
    client,
    operations: operations || [],
    isLoading,
    error: tokenValidation.isValid ? error : tokenValidation.error,
    fetchClientData,
    retryFetch
  };
};
