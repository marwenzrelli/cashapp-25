
import { useEffect, useCallback, useState } from "react";
import { usePublicClientData } from "./publicClientProfile/usePublicClientData";
import { useRealtimeSubscriptions } from "./publicClientProfile/useRealtimeSubscriptions";

export const usePublicClientProfile = (token: string | undefined) => {
  const [retryCount, setRetryCount] = useState(0);
  const {
    client,
    operations,
    isLoading,
    error,
    fetchClientData
  } = usePublicClientData(token);

  // Wrap fetchClientData in useCallback to prevent infinite re-renders
  const memoizedFetchClientData = useCallback(() => {
    console.log("Attempting to fetch client data, retry #", retryCount);
    fetchClientData();
  }, [token, fetchClientData, retryCount]);

  // Set up initial data fetching
  useEffect(() => {
    memoizedFetchClientData();
  }, [memoizedFetchClientData]);

  // Retry data fetching on certain errors - but limit retries
  useEffect(() => {
    if (error && 
        !isLoading && 
        retryCount < 2 && 
        (error.includes("network") || error.includes("connexion"))) {
      const timer = setTimeout(() => {
        console.log("Retrying data fetch due to network error");
        setRetryCount(prev => prev + 1);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [error, isLoading, retryCount]);

  // Set up realtime subscriptions only if we have a client
  useRealtimeSubscriptions(client?.id, memoizedFetchClientData);

  return { client, operations, isLoading, error };
};
