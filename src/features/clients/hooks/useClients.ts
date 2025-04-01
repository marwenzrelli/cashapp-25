
import { useState, useCallback, useEffect, useRef } from "react";
import { Client } from "../types";

// Import all the sub-modules
import { useFetchClients } from "./operations/fetchClients";
import { useCreateClient } from "./operations/createClient";
import { useUpdateClient } from "./operations/updateClient";
import { useDeleteClient } from "./operations/deleteClient";
import { useRefreshClientBalance } from "./operations/refreshBalance";
import { useRealtimeSubscription } from "./operations/realtime";
import { toast } from "sonner";

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedClients, setCachedClients] = useState<{data: Client[], timestamp: number} | null>(null);
  
  // Reference to track if a refresh is in progress
  const isRefreshingRef = useRef(false);
  // Reference to avoid showing multiple refresh toasts
  const toastShownRef = useRef(false);
  // Reference to track if component is mounted
  const isMountedRef = useRef(true);
  
  // Fetch clients functionality
  const { fetchClients: fetchClientsImpl } = useFetchClients(
    setClients,
    setLoading,
    setError
  );
  
  // Effect to set isMounted on mount/unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
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
  
  // Reset toast flag when loading completes
  useEffect(() => {
    if (!loading && toastShownRef.current) {
      toastShownRef.current = false;
    }
  }, [loading]);
  
  // Memoize the fetch function to avoid infinite loops
  const fetchClients = useCallback(
    (retry = 0, showToast = true) => {
      try {
        // If already refreshing, don't start another refresh
        if (isRefreshingRef.current) {
          console.log("Already refreshing clients, skipping duplicate request");
          return Promise.resolve();
        }
        
        isRefreshingRef.current = true;
        
        // If we're loading and have cached data, use the cache first to prevent blank screen
        if (loading && cachedClients && cachedClients.data.length > 0) {
          console.log("Using cached clients while loading fresh data");
          // Only update if component is still mounted
          if (isMountedRef.current) {
            setClients(cachedClients.data);
          }
        }
        
        // Show toast only once per refresh session if requested
        if (showToast && !toastShownRef.current) {
          toastShownRef.current = true;
        }
        
        return fetchClientsImpl(retry, showToast)
          .finally(() => {
            // Only update if component is still mounted
            if (isMountedRef.current) {
              isRefreshingRef.current = false;
            }
          });
      } catch (err) {
        console.error("Critical error in fetchClients:", err);
        
        // Only update if component is still mounted
        if (isMountedRef.current) {
          isRefreshingRef.current = false;
          
          if (showToast && !toastShownRef.current) {
            toast.error("Erreur de chargement", {
              description: "Impossible de charger les clients. Veuillez réessayer."
            });
            toastShownRef.current = true;
          }
          
          setError("Erreur de connexion au serveur");
          setLoading(false);
        }
        
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
  
  // Set up realtime subscription with debounce to avoid too many UI updates
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
