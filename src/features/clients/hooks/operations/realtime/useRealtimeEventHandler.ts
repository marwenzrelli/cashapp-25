
import { useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RealtimePayload } from "./types";

/**
 * Hook to handle realtime events with improved throttling
 */
export const useRealtimeEventHandler = (
  fetchClients: (retry?: number, showToast?: boolean) => Promise<void>,
  lastEventTime: number,
  setLastEventTime: (time: number) => void,
  throttleTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
) => {
  const queryClient = useQueryClient();
  const eventsQueueRef = useRef<string[]>([]);
  const processingEventsRef = useRef(false);
  
  // More aggressive throttling to prevent excessive refreshes
  const throttledFetch = () => {
    // Check if another fetch is already scheduled or processing
    if (throttleTimeoutRef.current || processingEventsRef.current) {
      console.log("Skipping throttled fetch due to existing scheduled fetch");
      return;
    }
    
    // Only fetch if we haven't received an event in the last 5 seconds (increased from 3)
    const now = Date.now();
    if (now - lastEventTime < 5000) {
      console.log("Skipping throttled fetch due to recent event");
      return;
    }
    
    setLastEventTime(now);
    
    // Schedule a fetch with an increased delay
    throttleTimeoutRef.current = setTimeout(() => {
      console.log("Executing throttled fetchClients");
      processingEventsRef.current = true;
      
      fetchClients(0, false)
        .catch(err => {
          console.error("Error in throttled fetchClients:", err);
        })
        .finally(() => {
          throttleTimeoutRef.current = null;
          processingEventsRef.current = false;
        });
        
      // Additionally trigger our custom event for client profile pages
      window.dispatchEvent(new CustomEvent('operations-update'));
      
      // Clear the events queue
      eventsQueueRef.current = [];
      
    }, 3000); // Increased to 3000ms (3 seconds) from 2000ms
  };

  // Handler for real-time updates with event batching
  const handleRealtimeUpdate = (payload: RealtimePayload) => {
    // Update the last event time
    setLastEventTime(Date.now());
    
    // Debug log
    console.log(`Change detected on ${payload.table}:`, payload.eventType);
    
    // Add this event to the queue if it's not already there
    const eventKey = `${payload.table}-${payload.eventType}-${payload.new?.id || 'unknown'}`;
    if (!eventsQueueRef.current.includes(eventKey)) {
      eventsQueueRef.current.push(eventKey);
    }
    
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
