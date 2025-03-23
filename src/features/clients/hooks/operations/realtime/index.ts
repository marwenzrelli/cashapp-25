
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
  
  // Configure a single global real-time listener to avoid multiple listeners
  useEffect(() => {
    // Skip realtime subscription on client profile pages to prevent refresh loops
    if (isClientProfileRef.current) {
      console.log("Skipping realtime subscription on client profile page");
      return;
    }
    
    // Only try to set up the subscription if not already subscribed
    if (subscribedRef.current) {
      return;
    }
    
    // Add initial delay before setting up realtime subscription
    const timer = setTimeout(() => {
      // Initial setup
      setupRealtimeListener();
    }, initialConnectionDelay);
    
    // Clean up on unmount
    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [fetchClients]);
};
