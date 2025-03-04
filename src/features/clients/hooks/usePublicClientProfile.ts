
import { useEffect, useCallback } from "react";
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

  // Wrap fetchClientData in useCallback to prevent infinite re-renders
  const memoizedFetchClientData = useCallback(() => {
    fetchClientData();
  }, [token, fetchClientData]);

  // Set up initial data fetching
  useEffect(() => {
    memoizedFetchClientData();
  }, [memoizedFetchClientData]);

  // Set up realtime subscriptions
  useRealtimeSubscriptions(client?.id, memoizedFetchClientData);

  return { client, operations, isLoading, error };
};
