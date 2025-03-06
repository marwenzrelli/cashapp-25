
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeSubscriptions = (
  clientId: number | undefined,
  refreshData: () => void
) => {
  useEffect(() => {
    if (!clientId) return;

    console.log("Setting up realtime subscriptions for client ID:", clientId);

    // Collection of all active subscriptions to clean up later
    const activeSubscriptions: { unsubscribe: () => void }[] = [];

    // Subscribe to changes in the client's record
    const clientChannel = supabase.channel(`client-${clientId}`);
    
    clientChannel
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
    
    activeSubscriptions.push(clientChannel);

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

      // Create separate channels for each type of operation
      const depositsChannel = supabase.channel(`deposits-${clientId}`);
      const withdrawalsChannel = supabase.channel(`withdrawals-${clientId}`);
      const transfersOutChannel = supabase.channel(`transfers-out-${clientId}`);
      const transfersInChannel = supabase.channel(`transfers-in-${clientId}`);

      // Subscribe to deposits for this client
      depositsChannel
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
      
      activeSubscriptions.push(depositsChannel);

      // Subscribe to withdrawals for this client
      withdrawalsChannel
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
      
      activeSubscriptions.push(withdrawalsChannel);

      // Subscribe to transfers (as sender)
      transfersOutChannel
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
      
      activeSubscriptions.push(transfersOutChannel);

      // Subscribe to transfers (as receiver)
      transfersInChannel
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
      
      activeSubscriptions.push(transfersInChannel);
    };

    getClientName();

    // Cleanup function for all channels
    return () => {
      console.log("Cleaning up realtime subscriptions");
      activeSubscriptions.forEach(subscription => {
        subscription.unsubscribe();
      });
    };
  }, [clientId, refreshData]);
};
