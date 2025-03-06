
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeSubscriptions = (
  clientId: number | undefined,
  refreshData: () => void
) => {
  useEffect(() => {
    if (!clientId) return;

    console.log("Setting up realtime subscriptions for client ID:", clientId);

    // Subscribe to changes in the client's record
    const clientSubscription = supabase
      .channel('public:clients')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'clients',
        filter: `id=eq.${clientId}`
      }, () => {
        console.log("Client data changed, refreshing...");
        refreshData();
      })
      .subscribe();

    // Get the client's full name to use in other subscriptions
    const getClientName = async () => {
      const { data } = await supabase
        .from('clients')
        .select('prenom, nom')
        .eq('id', clientId)
        .single();

      if (!data) return;

      const clientFullName = `${data.prenom} ${data.nom}`;
      console.log("Setting up subscription for client name:", clientFullName);

      // Subscribe to deposits for this client
      const depositsSubscription = supabase
        .channel('public:deposits')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'deposits',
          filter: `client_name=eq.${clientFullName}`
        }, () => {
          console.log("Deposits changed, refreshing...");
          refreshData();
        })
        .subscribe();

      // Subscribe to withdrawals for this client
      const withdrawalsSubscription = supabase
        .channel('public:withdrawals')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'withdrawals',
          filter: `client_name=eq.${clientFullName}`
        }, () => {
          console.log("Withdrawals changed, refreshing...");
          refreshData();
        })
        .subscribe();

      // Subscribe to transfers (as sender)
      const transfersOutSubscription = supabase
        .channel('public:transfers-out')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'transfers',
          filter: `from_client=eq.${clientFullName}`
        }, () => {
          console.log("Outgoing transfers changed, refreshing...");
          refreshData();
        })
        .subscribe();

      // Subscribe to transfers (as receiver)
      const transfersInSubscription = supabase
        .channel('public:transfers-in')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'transfers',
          filter: `to_client=eq.${clientFullName}`
        }, () => {
          console.log("Incoming transfers changed, refreshing...");
          refreshData();
        })
        .subscribe();

      return () => {
        depositsSubscription.unsubscribe();
        withdrawalsSubscription.unsubscribe();
        transfersOutSubscription.unsubscribe();
        transfersInSubscription.unsubscribe();
      };
    };

    const nameSubscription = getClientName();

    return () => {
      clientSubscription.unsubscribe();
      nameSubscription.then(cleanup => cleanup && cleanup());
    };
  }, [clientId, refreshData]);
};
