
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeSubscriptions = (
  clientId: number | null | undefined,
  fetchClientData: () => Promise<void> | void
) => {
  useEffect(() => {
    if (!clientId) return;
    
    console.log("Setting up realtime subscriptions for client ID:", clientId);
    
    // Mettre en place la souscription en temps réel
    const clientSubscription = supabase
      .channel('public_client_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'clients',
        filter: `id=eq.${clientId}`,
      }, (payload) => {
        console.log("Received client change:", payload);
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
      }, (payload) => {
        console.log("Received deposit change:", payload);
        fetchClientData();
      })
      .subscribe();

    const withdrawalsSubscription = supabase
      .channel('withdrawals_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'withdrawals',
      }, (payload) => {
        console.log("Received withdrawal change:", payload);
        fetchClientData();
      })
      .subscribe();

    const transfersSubscription = supabase
      .channel('transfers_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transfers',
      }, (payload) => {
        console.log("Received transfer change:", payload);
        fetchClientData();
      })
      .subscribe();

    return () => {
      console.log("Cleaning up realtime subscriptions");
      clientSubscription.unsubscribe();
      depositsSubscription.unsubscribe();
      withdrawalsSubscription.unsubscribe();
      transfersSubscription.unsubscribe();
    };
  }, [clientId, fetchClientData]);
};
