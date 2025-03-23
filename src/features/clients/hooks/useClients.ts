import { useState, useCallback, useEffect } from "react";
import { Client } from "../types";

// Import all the sub-modules
import { useFetchClients } from "./operations/fetchClients";
import { useCreateClient } from "./operations/createClient";
import { useUpdateClient } from "./operations/updateClient";
import { useDeleteClient } from "./operations/deleteClient";
import { useRefreshClientBalance } from "./operations/refreshBalance";
import { useRealtimeSubscription } from "./operations/realtimeSubscription";
import { toast } from "sonner";

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedClients, setCachedClients] = useState<{data: Client[], timestamp: number} | null>(null);
  
  // Fetch clients functionality
  const { fetchClients: fetchClientsImpl } = useFetchClients(
    setClients,
    setLoading,
    setError
  );
  
  // Improved cache handling - persist to localStorage and memory
  useEffect(() => {
    if (clients.length > 0) {
      // Store in memory cache
      setCachedClients({
        data: clients,
        timestamp: Date.now()
      });
      
      // Store in localStorage with better error handling
      try {
        const cacheData = {
          data: clients,
          timestamp: Date.now()
        };
        
        // Use a more efficient storage approach for large datasets
        // Break the storage into chunks if needed
        const dataString = JSON.stringify(cacheData);
        
        if (dataString.length < 5000000) { // ~5MB limit in most browsers
          localStorage.setItem('cachedClients', dataString);
        } else {
          console.warn("Client data too large for localStorage, using memory cache only");
        }
      } catch (err) {
        console.error("Error caching clients:", err);
      }
    }
  }, [clients]);
  
  // Improved cached client loading with expiration
  useEffect(() => {
    try {
      // Always start with showing cached data immediately
      const cached = localStorage.getItem('cachedClients');
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          // Use cache if it's less than 10 minutes old (reduced from 30)
          if (parsedCache && parsedCache.timestamp && 
              (Date.now() - parsedCache.timestamp < 10 * 60 * 1000)) {
            setCachedClients(parsedCache);
            setClients(parsedCache.data);
            console.log("Loaded clients from cache");
          }
        } catch (parseError) {
          console.warn("Error parsing cached clients:", parseError);
          localStorage.removeItem('cachedClients'); // Remove corrupt data
        }
      }
    } catch (err) {
      console.error("Error loading cached clients:", err);
    }
  }, []);
  
  // Optimized fetch function
  const fetchClients = useCallback(
    (retry = 0, showToast = true) => {
      try {
        // Always show cached data while loading new data
        if (loading && cachedClients && cachedClients.data.length > 0) {
          // Don't wait to show something to the user
          setClients(cachedClients.data);
          
          // Mark cached content in console for debugging
          console.log("Using cached data while fetching fresh data");
        }
        
        return fetchClientsImpl(retry, showToast);
      } catch (err) {
        console.error("Critical error in fetchClients:", err);
        if (showToast) {
          toast.error("Loading error", {
            description: "Failed to load clients. Please try again."
          });
        }
        setError("Server connection error");
        setLoading(false);
        return Promise.resolve();
      }
    },
    [fetchClientsImpl, loading, cachedClients]
  );

  // Create client functionality
  const { createClient } = useCreateClient(setClients, setLoading, fetchClients);
  
  // Update client functionality
  const { updateClient } = useUpdateClient(setClients, setLoading);
  
  // Delete client functionality
  const { deleteClient } = useDeleteClient(setClients, setLoading);
  
  // Refresh client balance functionality
  const { refreshClientBalance } = useRefreshClientBalance(setClients);
  
  // Set up realtime subscription
  useRealtimeSubscription(fetchClients);

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    refreshClientBalance,
    cachedClients: cachedClients?.data
  };
};
