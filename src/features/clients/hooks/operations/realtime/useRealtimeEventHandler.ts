
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
  
  // Aggressive throttling to prevent excessive refreshes - disabled auto-refresh
  const throttledFetch = () => {
    // Disabled automatic refresh to prevent page reloading every 2 seconds
    console.log("Automatic refresh is disabled to prevent excessive page refreshes");
    
    // Only invalidate query cache
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    return;
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
    
    // Invalidate related queries without automatic refresh
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
          // Only dispatch events for manually triggered changes
          console.log(`Event for client ${clientId} detected but automatic refresh disabled`);
        }
      }
    }
  };

  return {
    handleRealtimeUpdate
  };
};
