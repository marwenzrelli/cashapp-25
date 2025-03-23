
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectBackoffMs = 2000; // Start with 2s
  const [lastEventTime, setLastEventTime] = useState(0);
  
  // Configure a single global real-time listener to avoid multiple listeners
  useEffect(() => {
    // Only try to set up the subscription if not already subscribed
    if (subscribedRef.current) {
      return;
    }
    
    // Cleanup function to properly remove channels
    const cleanup = () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
        throttleTimeoutRef.current = null;
      }
      
      if (channelRef.current) {
        console.log("Cleaning up realtime subscription");
        try {
          supabase.removeChannel(channelRef.current);
        } catch (err) {
          console.error("Error removing channel:", err);
        }
        channelRef.current = null;
      }
      
      subscribedRef.current = false;
    };
    
    // Function to set up the realtime listener with error handling and reconnect logic
    const setupRealtimeListener = () => {
      // Clean up any existing channel first
      if (channelRef.current) {
        console.log("Cleaning up existing channel before creating a new one");
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error("Error removing existing channel:", error);
        }
        channelRef.current = null;
      }
      
      try {
        // If we've exceeded max reconnect attempts, stop trying
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.log(`Maximum reconnect attempts (${maxReconnectAttempts}) reached. Stopping reconnect attempts.`);
          return;
        }
        
        console.log(`Setting up realtime subscription (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
        
        // Throttled fetch function to prevent multiple rapid fetches
        const throttledFetch = () => {
          // Prevent fetching if another fetch is already scheduled
          if (throttleTimeoutRef.current) {
            return;
          }
          
          // Only fetch if we haven't received an event in the last 3 seconds
          const now = Date.now();
          if (now - lastEventTime < 3000) {
            console.log("Skipping throttled fetch due to recent event");
            return;
          }
          
          setLastEventTime(now);
          
          // Schedule a fetch with a delay
          throttleTimeoutRef.current = setTimeout(() => {
            console.log("Executing throttled fetchClients");
            fetchClients(0, false)
              .catch(err => {
                console.error("Error in throttled fetchClients:", err);
              })
              .finally(() => {
                throttleTimeoutRef.current = null;
              });
          }, 2000);
        };
        
        // Handler for real-time updates
        const handleRealtimeUpdate = (payload: RealtimePayload) => {
          // Update the last event time
          setLastEventTime(Date.now());
          
          // Debug log
          console.log(`Change detected on ${payload.table}:`, payload.eventType);
          
          // Schedule a throttled fetch
          throttledFetch();
          
          // Invalidate related queries
          queryClient.invalidateQueries({ queryKey: ['clients'] });
          
          if (payload.new && 'id' in payload.new) {
            queryClient.invalidateQueries({ queryKey: ['client', payload.new.id] });
          }
        };
        
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
            
            if (status === 'SUBSCRIBED') {
              // Successful subscription
              subscribedRef.current = true;
              reconnectAttemptsRef.current = 0; // Reset reconnect attempts on success
              // Fetch initial data
              fetchClients(0, false).catch(console.error);
            } 
            else if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
              // Subscription failed
              subscribedRef.current = false;
              
              // Increment reconnect attempts counter
              reconnectAttemptsRef.current++;
              
              console.log(`Subscription failed (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}), will retry in ${reconnectBackoffMs}ms`);
              
              // Exponential backoff for reconnection attempts
              const backoffDelay = reconnectBackoffMs * Math.pow(1.5, reconnectAttemptsRef.current - 1);
              
              // Schedule reconnection attempt with backoff
              setTimeout(() => {
                console.log("Retrying subscription setup after failure");
                setupRealtimeListener();
              }, backoffDelay);
            }
          });
        
        channelRef.current = channel;
      } catch (error) {
        console.error("Error setting up realtime listener:", error);
        subscribedRef.current = false;
        
        // Increment reconnect attempts counter
        reconnectAttemptsRef.current++;
        
        // Schedule reconnection attempt with backoff if we haven't hit the limit
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const backoffDelay = reconnectBackoffMs * Math.pow(1.5, reconnectAttemptsRef.current - 1);
          setTimeout(() => {
            console.log("Retrying subscription setup after error");
            setupRealtimeListener();
          }, backoffDelay);
        } else {
          console.log("Maximum reconnect attempts reached. Giving up on realtime subscription.");
          // Show a toast only once when we give up
          toast.error("Problème de connexion en temps réel", {
            description: "Les mises à jour en temps réel sont temporairement indisponibles."
          });
        }
      }
    };
    
    // Initial setup
    setupRealtimeListener();
    
    // Clean up on unmount
    return cleanup;
  }, [fetchClients, queryClient]);
};
