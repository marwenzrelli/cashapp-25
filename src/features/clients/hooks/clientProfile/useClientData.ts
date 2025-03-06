
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/features/clients/types";
import { toast } from "sonner";
import { handleSupabaseError } from "../utils/errorUtils";

export const useClientData = (clientId: number | null) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state at the start of any fetch operation
    setClient(null);
    setError(null);
    setIsLoading(true);
    
    const fetchClient = async () => {
      try {
        if (!clientId) {
          console.error("Missing client ID in URL");
          setError("Identifiant client manquant");
          setIsLoading(false);
          return;
        }
        
        console.log("Attempting to fetch client with ID:", clientId);
        
        const { data, error: supabaseError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .maybeSingle();

        if (supabaseError) {
          console.error("Error loading client data:", supabaseError);
          const errorMessage = handleSupabaseError(supabaseError);
          setError(errorMessage);
          setClient(null); // Ensure client is null when there's an error
          toast.error("Impossible de charger les informations du client", {
            description: errorMessage
          });
          setIsLoading(false);
          return;
        }

        if (!data) {
          const errorMessage = `Aucun client trouvé avec l'identifiant ${clientId}`;
          console.error(errorMessage);
          setError(errorMessage);
          setClient(null); // Ensure client is null when not found
          toast.error("Client introuvable", {
            description: errorMessage
          });
          setIsLoading(false);
          return;
        }

        console.log("Client successfully retrieved:", data);
        setClient(data);
        // Explicitly clear the error state when we successfully fetch data
        setError(null);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading client:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        setError(errorMessage);
        setClient(null); // Ensure client is null when there's an error
        toast.error("Impossible de charger les informations du client", {
          description: errorMessage
        });
        setIsLoading(false);
      }
    };

    if (clientId) {
      fetchClient();
    }

    // Track all subscriptions to clean them up on unmount
    const supabaseChannels = [];

    if (clientId) {
      const clientSubscription = supabase
        .channel('public_client_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `id=eq.${clientId}`,
        }, (payload) => {
          console.log("Client update received:", payload);
          if (payload.eventType === 'DELETE') {
            setClient(null);
            setError("Ce client a été supprimé");
            toast.error("Client supprimé", {
              description: "Ce client a été supprimé de la base de données"
            });
          } else {
            // Clear any existing error when we receive updates
            setError(null);
            setClient(payload.new as Client);
          }
        })
        .subscribe();
      
      supabaseChannels.push(clientSubscription);

      // Track real-time updates for operations that might affect the client balance
      const operationsTables = ['deposits', 'withdrawals', 'transfers'];
      
      operationsTables.forEach(table => {
        const subscription = supabase
          .channel(`${table}_changes`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table,
          }, () => {
            // Refresh client data when operations change
            fetchClient();
          })
          .subscribe();
          
        supabaseChannels.push(subscription);
      });
    }

    return () => {
      // Clean up all channels
      supabaseChannels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [clientId]);

  return { client, isLoading, error };
};
