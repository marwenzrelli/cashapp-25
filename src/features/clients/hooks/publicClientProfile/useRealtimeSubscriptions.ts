
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeSubscriptions = (
  clientId: number | null | undefined,
  fetchClientData: () => Promise<void> | void
) => {
  useEffect(() => {
    if (!clientId) return;
    
    // Mettre en place la souscription en temps réel
    const clientSubscription = supabase
      .channel('public_client_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'clients',
        filter: `id=eq.${clientId}`,
      }, () => {
        fetchClientData();
      })
      .subscribe();

    // Souscriptions pour les opérations
    const depositsSubscription = supabase
      .channel('deposits_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'deposits',
      }, () => {
        fetchClientData();
      })
      .subscribe();

    const withdrawalsSubscription = supabase
      .channel('withdrawals_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'withdrawals',
      }, () => {
        fetchClientData();
      })
      .subscribe();

    const transfersSubscription = supabase
      .channel('transfers_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transfers',
      }, () => {
        fetchClientData();
      })
      .subscribe();

    return () => {
      clientSubscription.unsubscribe();
      depositsSubscription.unsubscribe();
      withdrawalsSubscription.unsubscribe();
      transfersSubscription.unsubscribe();
    };
  }, [clientId, fetchClientData]);
};
