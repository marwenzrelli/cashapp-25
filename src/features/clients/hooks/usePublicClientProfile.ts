
import { useEffect } from "react";
import { usePublicClientData } from "./publicClientProfile/usePublicClientData";
import { useRealtimeSubscriptions } from "./publicClientProfile/useRealtimeSubscriptions";

export const usePublicClientProfile = (token: string | undefined) => {
  const {
    client,
    operations,
    isLoading,
    error,
    fetchClientData
  } = usePublicClientData(token);

  // Set up initial data fetching
  useEffect(() => {
    fetchClientData();
  }, [token]);

  // Set up realtime subscriptions
  useRealtimeSubscriptions(client?.id, fetchClientData);

  return { client, operations, isLoading, error };
};
