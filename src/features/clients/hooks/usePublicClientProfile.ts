
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
    console.log("Fetching client data for token:", token);
    fetchClientData();
  }, [token, fetchClientData]);

  // Set up initial data fetching
  useEffect(() => {
    console.log("Initial data fetch for token:", token);
    memoizedFetchClientData();
  }, [memoizedFetchClientData]);

  // Set up realtime subscriptions
  useRealtimeSubscriptions(client?.id, memoizedFetchClientData);

  return { client, operations, isLoading, error, fetchClientData: memoizedFetchClientData };
};
