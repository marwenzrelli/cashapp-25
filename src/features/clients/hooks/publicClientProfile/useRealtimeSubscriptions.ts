
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeSubscriptions = (
  clientId: number | undefined,
  refreshData: () => void
) => {
  useEffect(() => {
    if (!clientId) return;

    console.log("Setting up realtime subscriptions for client ID:", clientId);
    
    // Use a single channel for all client-related changes
    const channel = supabase.channel(`public-client-${clientId}`);
    
    // Subscribe to changes in the client's record
    channel
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'clients',
        filter: `id=eq.${clientId}`
      }, (payload) => {
        console.log("Client data changed:", payload);
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
    
    // Clean up subscription on unmount
    return () => {
      console.log("Cleaning up realtime subscriptions");
      channel.unsubscribe();
    };
  }, [clientId, refreshData]);
};
