
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeState } from "./types";
import { createRealtimeChannel } from "./useRealtimeChannel";

/**
 * Hook to manage the realtime connection setup and reconnection logic
 */
export const useRealtimeConnection = (
  fetchClients: (retry?: number, showToast?: boolean) => Promise<void>,
  handleRealtimeUpdate: (payload: any) => void,
  state: RealtimeState,
  updateState: (updates: Partial<RealtimeState>) => void,
  config: {
    maxReconnectAttempts: number;
    reconnectBackoffMs: number;
  }
) => {
  const { maxReconnectAttempts, reconnectBackoffMs } = config;

  const setupRealtimeListener = () => {
    // Clean up any existing channel first
    if (state.channel) {
      console.log("Cleaning up existing channel before creating a new one");
      try {
        supabase.removeChannel(state.channel);
      } catch (error) {
        console.error("Error removing existing channel:", error);
      }
      updateState({ channel: null });
    }
    
    try {
      // If we've exceeded max reconnect attempts, stop trying
      if (state.reconnectAttempts >= maxReconnectAttempts) {
        console.log(`Maximum reconnect attempts (${maxReconnectAttempts}) reached. Stopping reconnect attempts.`);
        return;
      }
      
      console.log(`Setting up realtime subscription (attempt ${state.reconnectAttempts + 1}/${maxReconnectAttempts})`);
      
      const channel = createRealtimeChannel(handleRealtimeUpdate)
        .subscribe((status) => {
          console.log("Statut de l'abonnement réel-time:", status);
          
          if (status === 'SUBSCRIBED') {
            // Successful subscription
            updateState({ 
              isSubscribed: true,
              reconnectAttempts: 0 // Reset reconnect attempts on success
            });
            // Fetch initial data
            fetchClients(0, false).catch(console.error);
          } 
          else if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
            // Subscription failed
            updateState({ isSubscribed: false });
            
            // Increment reconnect attempts counter
            const newAttempts = state.reconnectAttempts + 1;
            updateState({ reconnectAttempts: newAttempts });
            
            console.log(`Subscription failed (attempt ${newAttempts}/${maxReconnectAttempts}), will retry in ${reconnectBackoffMs}ms`);
            
            // Exponential backoff for reconnection attempts
            const backoffDelay = reconnectBackoffMs * Math.pow(1.5, newAttempts - 1);
            
            // Schedule reconnection attempt with backoff
            setTimeout(() => {
              console.log("Retrying subscription setup after failure");
              setupRealtimeListener();
            }, backoffDelay);
          }
        });
      
      updateState({ channel });
    } catch (error) {
      console.error("Error setting up realtime listener:", error);
      updateState({ isSubscribed: false });
      
      // Increment reconnect attempts counter
      const newAttempts = state.reconnectAttempts + 1;
      updateState({ reconnectAttempts: newAttempts });
      
      // Schedule reconnection attempt with backoff if we haven't hit the limit
      if (newAttempts < maxReconnectAttempts) {
        const backoffDelay = reconnectBackoffMs * Math.pow(1.5, newAttempts - 1);
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

  return {
    setupRealtimeListener
  };
};
