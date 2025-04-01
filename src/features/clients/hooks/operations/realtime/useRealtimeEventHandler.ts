
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
  const pendingUpdatesRef = useRef(0);

  // Throttled fetch function to prevent multiple rapid fetches
  const throttledFetch = () => {
    // Prevent fetching if another fetch is already scheduled
    if (throttleTimeoutRef.current) {
      pendingUpdatesRef.current += 1;
      console.log(`Throttled fetch already scheduled. Pending updates: ${pendingUpdatesRef.current}`);
      return;
    }
    
    // Only fetch if we haven't received an event in the last 3 seconds
    const now = Date.now();
    if (now - lastEventTime < 3000) {
      console.log("Skipping throttled fetch due to recent event");
      return;
    }
    
    setLastEventTime(now);
    pendingUpdatesRef.current = 0;
    
    // Schedule a fetch with a delay
    throttleTimeoutRef.current = setTimeout(() => {
      console.log("Executing throttled fetchClients");
      
      fetchClients(0, false)
        .catch(err => {
          console.error("Error in throttled fetchClients:", err);
        })
        .finally(() => {
          throttleTimeoutRef.current = null;
          
          // If more updates arrived during this fetch, schedule another one
          if (pendingUpdatesRef.current > 0) {
            console.log(`Processing ${pendingUpdatesRef.current} pending updates`);
            setTimeout(() => {
              throttledFetch();
            }, 1000);
          }
        });
        
      // Additionally trigger our custom event for client profile pages
      window.dispatchEvent(new CustomEvent('operations-update'));
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
      
      // When a specific client is affected, dispatch a targeted event
      if (payload.table === 'clients' || payload.table === 'deposits' || 
          payload.table === 'withdrawals' || payload.table === 'transfers') {
        
        // For client-specific operations, include the client ID
        const clientId = 'client_id' in payload.new ? payload.new.client_id : 
                        ('id' in payload.new && payload.table === 'clients') ? payload.new.id : null;
                        
        if (clientId) {
          window.dispatchEvent(new CustomEvent('operations-update', {
            detail: { 
              clientId,
              table: payload.table,
              operationType: payload.eventType
            }
          }));
        }
      }
    }
  };

  return {
    handleRealtimeUpdate
  };
};
