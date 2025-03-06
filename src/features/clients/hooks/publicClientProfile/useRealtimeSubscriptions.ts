
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
    const clientChannel = supabase.channel(`public-client-${clientId}`);
    
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
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to client-${clientId} changes`);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to client-${clientId} changes`);
        }
      });
    
    activeSubscriptions.push(clientChannel);

    // Get the client's full name to use in other subscriptions
    const getClientName = async () => {
      try {
        const { data } = await supabase
          .from('clients')
          .select('prenom, nom')
          .eq('id', clientId)
          .single();

        if (!data) return;

        const clientFullName = `${data.prenom} ${data.nom}`;
        console.log("Setting up subscription for client name:", clientFullName);

        // Create separate channels for each type of operation
        const depositsChannel = supabase.channel(`public-deposits-${clientId}`);
        const withdrawalsChannel = supabase.channel(`public-withdrawals-${clientId}`);
        const transfersOutChannel = supabase.channel(`public-transfers-out-${clientId}`);
        const transfersInChannel = supabase.channel(`public-transfers-in-${clientId}`);

        // Define the filter for client name in string format for Postgres
        const clientNameFilter = `client_name=eq."${clientFullName}"`;
        const fromClientFilter = `from_client=eq."${clientFullName}"`;
        const toClientFilter = `to_client=eq."${clientFullName}"`;

        // Subscribe to deposits for this client
        depositsChannel
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'deposits',
            filter: clientNameFilter
          }, () => {
            console.log("Deposits changed, refreshing...");
            refreshData();
          })
          .subscribe((status) => {
            console.log(`Deposits subscription status: ${status}`);
          });
        
        activeSubscriptions.push(depositsChannel);

        // Subscribe to withdrawals for this client
        withdrawalsChannel
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'withdrawals',
            filter: clientNameFilter
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
            filter: fromClientFilter
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
            filter: toClientFilter
          }, () => {
            console.log("Incoming transfers changed, refreshing...");
            refreshData();
          })
          .subscribe();
        
        activeSubscriptions.push(transfersInChannel);
      } catch (error) {
        console.error("Error setting up realtime subscriptions:", error);
      }
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
