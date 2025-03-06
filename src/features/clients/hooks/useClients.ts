
import { useState, useCallback } from "react";
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
  
  // Fetch clients functionality
  const { fetchClients: fetchClientsImpl } = useFetchClients(
    setClients,
    setLoading,
    setError
  );
  
  // Memoize the fetch function to avoid infinite loops
  const fetchClients = useCallback(
    (retry = 0, showToast = true) => {
      try {
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
    [fetchClientsImpl]
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
    refreshClientBalance
  };
};
