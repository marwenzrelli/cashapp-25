
import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useOperationsRealtime = (refreshOperations: (force: boolean) => Promise<void>) => {
  const realtimeSubscribedRef = useRef(false);
  const channelRef = useRef<any>(null);
  const lastRealtimeUpdateRef = useRef<number>(0);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced handler for realtime updates
  const handleRealtimeUpdate = useCallback(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastRealtimeUpdateRef.current;
    
    // Debounce to prevent multiple refreshes in quick succession
    if (timeSinceLastUpdate < 2000) {
      console.log(`Debouncing realtime update, last update was ${timeSinceLastUpdate}ms ago`);
      
      // Clear any pending timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      // Set a new timeout to refresh after the debounce period
      refreshTimeoutRef.current = setTimeout(() => {
        console.log('Executing debounced refresh');
        refreshOperations(false); // Use false to not force refresh if not needed
        lastRealtimeUpdateRef.current = Date.now();
      }, 2000);
      
      return;
    }
    
    // If it's been more than 2 seconds since the last update, refresh immediately
    console.log('Refreshing operations due to realtime update');
    refreshOperations(false);
    lastRealtimeUpdateRef.current = now;
  }, [refreshOperations]);

  // Set up real-time subscription with improved error handling
  useEffect(() => {
    // Function to set up the realtime channel
    const setupRealtimeChannel = () => {
      if (realtimeSubscribedRef.current || channelRef.current) return;
      
      try {
        console.log("Setting up realtime subscription for operations");
        
        // Use a unique channel ID to prevent collisions
        const channelId = `operations-realtime-${Date.now()}`;
        
        const channel = supabase
          .channel(channelId)
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'deposits'
          }, () => {
            console.log('Deposit change detected');
            handleRealtimeUpdate();
          })
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'withdrawals'
          }, () => {
            console.log('Withdrawal change detected');
            handleRealtimeUpdate();
          })
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'transfers'
          }, () => {
            console.log('Transfer change detected');
            handleRealtimeUpdate();
          })
          .subscribe((status) => {
            console.log(`Realtime subscription status: ${status}`);
            if (status === 'SUBSCRIBED') {
              realtimeSubscribedRef.current = true;
              channelRef.current = channel;
            } else if (status === 'CHANNEL_ERROR') {
              console.error("Channel error occurred");
              realtimeSubscribedRef.current = false;
              channelRef.current = null;
            }
          });
          
        return channel;
      } catch (error) {
        console.error("Error setting up realtime subscription:", error);
        realtimeSubscribedRef.current = false;
        return null;
      }
    };
    
    // Set up the channel
    const channel = setupRealtimeChannel();
    
    // Cleanup function
    return () => {
      if (channel) {
        console.log("Cleaning up realtime subscription");
        supabase.removeChannel(channel);
        realtimeSubscribedRef.current = false;
        channelRef.current = null;
      }
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [handleRealtimeUpdate]);

  return {
    cleanupRealtime: useCallback(() => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    }, [])
  };
};
