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
    const fetchClient = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!clientId) {
          console.error("Client ID manquant dans l'URL");
          setError("Identifiant client manquant");
          setIsLoading(false);
          return;
        }
        
        console.log("Tentative de récupération du client avec ID:", clientId);
        
        const { data, error: supabaseError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .maybeSingle();

        if (supabaseError) {
          console.error("Erreur lors du chargement du client:", supabaseError);
          const errorMessage = handleSupabaseError(supabaseError);
          setError(errorMessage);
          toast.error("Impossible de charger les informations du client", {
            description: errorMessage
          });
          setClient(null);
          return;
        }

        if (!data) {
          const errorMessage = `Aucun client trouvé avec l'identifiant ${clientId}`;
          console.error(errorMessage);
          setError(errorMessage);
          toast.error("Client introuvable", {
            description: errorMessage
          });
          setClient(null);
          return;
        }

        console.log("Client récupéré avec succès:", data);
        setClient(data);
        setError(null);
      } catch (error) {
        console.error("Erreur lors du chargement du client:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        setError(errorMessage);
        toast.error("Impossible de charger les informations du client", {
          description: errorMessage
        });
        setClient(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();

    const clientSubscription = supabase
      .channel('public_client_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'clients',
        filter: `id=eq.${clientId}`,
      }, (payload) => {
        console.log("Mise à jour client reçue:", payload);
        if (payload.eventType === 'DELETE') {
          setClient(null);
          setError("Ce client a été supprimé");
          toast.error("Client supprimé", {
            description: "Ce client a été supprimé de la base de données"
          });
        } else {
          setClient(payload.new as Client);
        }
      })
      .subscribe();

    const depositsSubscription = supabase
      .channel('deposits_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'deposits',
      }, () => {
        fetchClient();
      })
      .subscribe();

    const withdrawalsSubscription = supabase
      .channel('withdrawals_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'withdrawals',
      }, () => {
        fetchClient();
      })
      .subscribe();

    const transfersSubscription = supabase
      .channel('transfers_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transfers',
      }, () => {
        fetchClient();
      })
      .subscribe();

    return () => {
      clientSubscription.unsubscribe();
      depositsSubscription.unsubscribe();
      withdrawalsSubscription.unsubscribe();
      transfersSubscription.unsubscribe();
      // Make sure to unsubscribe from all channels to prevent memory leaks
      if (window.supabaseChannels) {
        window.supabaseChannels.forEach(channel => {
          supabase.removeChannel(channel);
        });
      }
    };
  }, [clientId]);

  return { client, isLoading, error };
};
