
import { useEffect, useCallback } from "react";
import { usePublicClientData } from "./publicClientProfile/usePublicClientData";
import { useRealtimeSubscriptions } from "./publicClientProfile/useRealtimeSubscriptions";

export const usePublicClientProfile = (token: string | undefined) => {
  const { 
    client, 
    operations, 
    isLoading, 
    error, 
    fetchClientData,
    retryFetch 
  } = usePublicClientData(token);

  // Extract the client ID from the client object for subscriptions
  const clientId = client?.id;

  // Set up realtime subscriptions
  const refreshData = useCallback(() => {
    console.log("Refreshing client data due to realtime update");
    fetchClientData();
  }, [fetchClientData]);

  // Pass clientId and refreshData to useRealtimeSubscriptions
  useRealtimeSubscriptions(clientId, refreshData);
  
  // Initial data fetch on component mount or token change
  useEffect(() => {
    console.log("Initial data fetch triggered with token:", token);
    fetchClientData();
  }, [token, fetchClientData]);

  return {
    client,
    operations,
    isLoading,
    error,
    fetchClientData,
    retryFetch
  };
};
