
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
  
  // Cache clients in localStorage when available
  useEffect(() => {
    if (clients.length > 0) {
      // Store in memory cache
      setCachedClients({
        data: clients,
        timestamp: Date.now()
      });
      
      // Also store in localStorage for persistence across refreshes
      try {
        localStorage.setItem('cachedClients', JSON.stringify({
          data: clients,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error("Error caching clients:", err);
      }
    }
  }, [clients]);
  
  // Load cached clients on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('cachedClients');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        // Only use cache if it's less than 30 minutes old
        if (parsedCache && parsedCache.timestamp && 
            (Date.now() - parsedCache.timestamp < 30 * 60 * 1000)) {
          setCachedClients(parsedCache);
          setClients(parsedCache.data);
          console.log("Loaded clients from cache");
        }
      }
    } catch (err) {
      console.error("Error loading cached clients:", err);
    }
  }, []);
  
  // Memoize the fetch function to avoid infinite loops
  const fetchClients = useCallback(
    (retry = 0, showToast = true) => {
      try {
        // If we're loading and have cached data, use the cache first
        if (loading && cachedClients && cachedClients.data.length > 0) {
          setClients(cachedClients.data);
        }
        
        return fetchClientsImpl(retry, showToast);
      } catch (err) {
        console.error("Critical error in fetchClients:", err);
        if (showToast) {
          toast.error("Erreur de chargement", {
            description: "Impossible de charger les clients. Veuillez réessayer."
          });
        }
        setError("Erreur de connexion au serveur");
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
