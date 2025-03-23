
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
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const channelRef = useRef<any>(null);
  
  // Optimized realtime listener setup with improved deduplication
  useEffect(() => {
    if (channelRef.current) {
      // If we already have a channel, don't create another one
      return () => {};
    }
    
    // Set up a single listener for all tables to avoid multiple listeners
    const setupRealtimeListener = async () => {
      try {
        console.log("Setting up realtime subscription");
        // Create a single channel for all tables with optimized event handling
        const channel = supabase
          .channel('table-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'clients' },
            (payload: RealtimePayload) => {
              // Prevent duplicate events with improved deduplication logic
              const currentTime = Date.now();
              const payloadId = payload.new?.id || payload.old?.id;
              
              // Check if this is a duplicate event (same table+id within 1000ms)
              if (lastProcessedRef.current && 
                  lastProcessedRef.current.table === 'clients' &&
                  lastProcessedRef.current.id === payloadId &&
                  currentTime - lastProcessedRef.current.timestamp < 1000) {
                console.log("Skipping duplicate event");
                return;
              }
              
              // Update last processed
              lastProcessedRef.current = {
                table: 'clients',
                id: payloadId,
                timestamp: currentTime
              };
              
              console.log("Change detected in clients table:", payload.eventType);
              
              // Clear any existing debounce timer
              if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
              }
              
              // Debounce the fetch operation to avoid multiple fetches in quick succession
              if (!isProcessingRef.current) {
                debounceTimerRef.current = setTimeout(() => {
                  isProcessingRef.current = true;
                  
                  // Don't show error toasts for background updates
                  fetchClients(0, false)
                    .catch(err => console.error("Error fetching clients after realtime update:", err))
                    .finally(() => {
                      isProcessingRef.current = false;
                    });
                  
                  // Invalidate related queries with minimal scope
                  queryClient.invalidateQueries({ queryKey: ['clients'] });
                  if (payload.new && 'id' in payload.new) {
                    queryClient.invalidateQueries({ queryKey: ['client', payload.new.id] });
                  }
                  
                  debounceTimerRef.current = null;
                }, 1000); // Increase to 1000ms to catch multiple rapid changes
              }
            }
          )
          .subscribe((status) => {
            console.log("Realtime subscription status:", status);
          });

        // Save the channel reference
        channelRef.current = channel;
        
        return () => {
          console.log("Removing realtime channel subscription");
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
          }
          
          if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
          }
        };
      } catch (error) {
        console.error("Error setting up realtime listener:", error);
        // Clean up failed channel attempt
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
        return () => {};
      }
    };

    const cleanupFn = setupRealtimeListener();
    return () => {
      if (typeof cleanupFn === 'function') {
        cleanupFn();
      } else if (cleanupFn instanceof Promise) {
        cleanupFn.then(fn => {
          if (fn && typeof fn === 'function') fn();
        });
      }
    };
  }, [fetchClients, queryClient]);
};
