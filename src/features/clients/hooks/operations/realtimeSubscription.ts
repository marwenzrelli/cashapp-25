
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

// Type definition for the payload from Supabase realtime
interface RealtimePayload {
  new: Record<string, any> | null;
  old: Record<string, any> | null;
  eventType: string;
  [key: string]: any;
}

export const useRealtimeSubscription = (fetchClients: (retry?: number, showToast?: boolean) => Promise<void>) => {
  const queryClient = useQueryClient();
  
  // Prevent multiple rapid fetches
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscribedRef = useRef(false);
  const channelRef = useRef<any>(null);
  
  // Configure a single global real-time listener to avoid multiple listeners
  useEffect(() => {
    // Only set up the subscription once
    if (subscribedRef.current) {
      return;
    }
    
    subscribedRef.current = true;
    console.log("Setting up realtime subscription...");
    
    // Throttled fetch function to prevent multiple rapid fetches
    const throttledFetch = () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
      
      throttleTimeoutRef.current = setTimeout(() => {
        console.log("Throttled fetchClients triggered by realtime update");
        fetchClients(0, false).catch(err => {
          console.error("Error in throttled fetchClients:", err);
        });
        throttleTimeoutRef.current = null;
      }, 2000); // 2 seconds throttle to avoid multiple fetches
    };
    
    // Handler for real-time updates
    const handleRealtimeUpdate = (payload: RealtimePayload) => {
      console.log(`Changement détecté:`, payload);
      throttledFetch();
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      if (payload.new && 'id' in payload.new) {
        queryClient.invalidateQueries({ queryKey: ['client', payload.new.id] });
      }
    };
    
    // Setup a single listener for all tables
    const setupRealtimeListener = async () => {
      try {
        // Create a single channel for all tables
        const channel = supabase
          .channel('db-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'clients' },
            handleRealtimeUpdate
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'deposits' },
            handleRealtimeUpdate
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'withdrawals' },
            handleRealtimeUpdate
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'transfers' },
            handleRealtimeUpdate
          )
          .subscribe((status) => {
            console.log("Statut de l'abonnement réel-time:", status);
            
            if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
              subscribedRef.current = false;
              console.log("Subscription failed, will retry on next render");
            }
          });

        channelRef.current = channel;
        return true;
      } catch (error) {
        console.error("Erreur lors de la configuration de l'écouteur en temps réel:", error);
        subscribedRef.current = false;
        return false;
      }
    };

    // Set up listener
    setupRealtimeListener();
    
    // Clean up on unmount
    return () => {
      // Clear any pending throttled operations
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
        throttleTimeoutRef.current = null;
      }
      
      // Clean up the subscription
      if (channelRef.current) {
        console.log("Cleaning up realtime subscription on unmount");
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      subscribedRef.current = false;
    };
  }, [fetchClients, queryClient]);
};
