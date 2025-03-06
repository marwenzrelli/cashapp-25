
import { useEffect } from "react";
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

  // Set up realtime subscriptions
  const { setupSubscriptions, cleanupSubscriptions } = useRealtimeSubscriptions(fetchClientData);

  useEffect(() => {
    if (client) {
      // Set up real-time subscriptions when client data is available
      setupSubscriptions();
    }

    // Cleanup subscriptions when component unmounts
    return () => {
      cleanupSubscriptions();
    };
  }, [client, setupSubscriptions, cleanupSubscriptions]);

  return {
    client,
    operations,
    isLoading,
    error,
    fetchClientData,
    retryFetch
  };
};
