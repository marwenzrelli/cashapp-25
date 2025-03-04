
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/features/clients/types";
import { toast } from "sonner";

export const useClientData = (clientId: number | null) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        if (!clientId) {
          console.error("Client ID manquant dans l'URL");
          setError("ID client manquant");
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
          setError(supabaseError.message);
          toast.error("Impossible de charger les informations du client");
          setIsLoading(false);
          return;
        }

        if (!data) {
          console.error("Client non trouvé avec ID:", clientId);
          setError(`Client avec ID ${clientId} non trouvé`);
          setIsLoading(false);
          return;
        }

        console.log("Client récupéré avec succès:", data);
        setClient(data);
        setError(null);
      } catch (error: any) {
        console.error("Erreur lors du chargement du client:", error);
        setError(error.message || "Erreur inconnue");
        toast.error("Impossible de charger les informations du client");
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
        setClient(payload.new as Client);
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
    };
  }, [clientId]);

  return { client, isLoading, error };
};
