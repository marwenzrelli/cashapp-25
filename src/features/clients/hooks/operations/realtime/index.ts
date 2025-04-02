
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeConfig } from "./useRealtimeConfig";
import { useRealtimeState } from "./useRealtimeState";
import { useRealtimeEventHandler } from "./useRealtimeEventHandler";
import { useRealtimeConnection } from "./useRealtimeConnection";
import { useRealtimeCleanup } from "./useRealtimeCleanup";

/**
 * Hook to set up and manage realtime subscriptions to Supabase
 */
export const useRealtimeSubscription = (fetchClients: (retry?: number, showToast?: boolean) => Promise<void>) => {
  // Get configuration
  const { 
    maxReconnectAttempts, 
    reconnectBackoffMs, 
    throttleTimeMs, 
    throttleTimeoutRef,
    initialConnectionDelay 
  } = useRealtimeConfig();
  
  // Reference to track if we're on a client profile page
  const isClientProfileRef = useRef(window.location.pathname.includes('/clients/'));
  
  // Manage state
  const { 
    subscribedRef, 
    channelRef,
    reconnectAttemptsRef, 
    lastEventTime, 
    setLastEventTime,
    getState,
    updateState,
    resetState
  } = useRealtimeState();
  
  // Set up event handler
  const { handleRealtimeUpdate } = useRealtimeEventHandler(
    fetchClients, 
    lastEventTime, 
    setLastEventTime, 
    throttleTimeoutRef
  );
  
  // Set up connection manager
  const { setupRealtimeListener } = useRealtimeConnection(
    fetchClients,
    handleRealtimeUpdate,
    getState(),
    updateState,
    { maxReconnectAttempts, reconnectBackoffMs }
  );
  
  // Set up cleanup function
  const { cleanup } = useRealtimeCleanup(getState(), throttleTimeoutRef);
  
  // We disable the global realtime listener - we'll rely on initial page load only
  useEffect(() => {
    // Disabling automatic realtime subscription to avoid continuous refreshes
    // The data will only be fetched when the component mounts
    
    // Clean up on unmount
    return () => {
      cleanup();
    };
  }, [fetchClients, cleanup]);

  return;
};
