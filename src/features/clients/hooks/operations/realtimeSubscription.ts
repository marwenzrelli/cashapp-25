
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
  const lastProcessedRef = useRef<{
    table: string;
    id: string | number | null;
    timestamp: number;
  } | null>(null);
  
  // Prevent multiple rapid fetches
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscribedRef = useRef(false);
  const channelRef = useRef<any>(null);
  
  // Configure a single global real-time listener to avoid multiple listeners
  useEffect(() => {
    // Only set up the subscription once
    if (subscribedRef.current) {
      return () => {};
    }
    
    subscribedRef.current = true;
    
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
    const handleRealtimeUpdate = (payload: RealtimePayload, tableName: string) => {
      // Prevent duplicate events
      const currentTime = Date.now();
      const payloadId = payload.new?.id || payload.old?.id;
      
      // Check if this is a duplicate event (same table+id within 1000ms)
      if (lastProcessedRef.current && 
          lastProcessedRef.current.table === tableName &&
          lastProcessedRef.current.id === payloadId &&
          currentTime - lastProcessedRef.current.timestamp < 1000) {
        return;
      }
      
      // Update last processed
      lastProcessedRef.current = {
        table: tableName,
        id: payloadId,
        timestamp: currentTime
      };
      
      console.log(`Changement détecté dans la table ${tableName}:`, payload);
      throttledFetch();
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [tableName] });
      
      if (tableName === 'clients' && payload.new && 'id' in payload.new) {
        queryClient.invalidateQueries({ queryKey: ['client', payload.new.id] });
        queryClient.invalidateQueries({ queryKey: ['clientOperations', payload.new.id] });
      }
      
      // For operations that affect client balances, invalidate clients queries too
      if (['deposits', 'withdrawals', 'transfers'].includes(tableName)) {
        queryClient.invalidateQueries({ queryKey: ['clients'] });
        queryClient.invalidateQueries({ queryKey: ['operations'] });
      }
    };
    
    // Setup a single listener for all tables
    const setupRealtimeListener = async () => {
      try {
        if (channelRef.current) {
          console.log("Cleaning up existing channel before creating a new one");
          await supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
        
        // Create a single channel for all tables
        const channel = supabase
          .channel('table-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'clients' },
            (payload: RealtimePayload) => handleRealtimeUpdate(payload, 'clients')
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'deposits' },
            (payload: RealtimePayload) => handleRealtimeUpdate(payload, 'deposits')
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'withdrawals' },
            (payload: RealtimePayload) => handleRealtimeUpdate(payload, 'withdrawals')
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'transfers' },
            (payload: RealtimePayload) => handleRealtimeUpdate(payload, 'transfers')
          )
          .subscribe((status) => {
            console.log("Statut de l'abonnement réel-time:", status);
            
            // If subscription fails, try to set up again after a delay
            if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
              subscribedRef.current = false;
              setTimeout(() => {
                console.log("Retrying subscription setup after failure");
                setupRealtimeListener().catch(err => {
                  console.error("Error in retry subscription setup:", err);
                });
              }, 5000);
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
    setupRealtimeListener().catch(err => {
      console.error("Error in initial subscription setup:", err);
    });
    
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
        supabase.removeChannel(channelRef.current)
          .then(() => {
            console.log("Channel removed successfully");
          })
          .catch(err => {
            console.error("Error removing channel:", err);
          });
        channelRef.current = null;
      }
      
      subscribedRef.current = false;
    };
  }, [fetchClients, queryClient]);
};
