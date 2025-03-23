
import { useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RealtimePayload } from "./types";

/**
 * Hook to handle realtime events
 */
export const useRealtimeEventHandler = (
  fetchClients: (retry?: number, showToast?: boolean) => Promise<void>,
  lastEventTime: number,
  setLastEventTime: (time: number) => void,
  throttleTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
) => {
  const queryClient = useQueryClient();

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

  return {
    handleRealtimeUpdate
  };
};
