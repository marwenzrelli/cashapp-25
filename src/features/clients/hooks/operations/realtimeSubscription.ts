
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
  
  // Optimized realtime listener setup with improved deduplication
  useEffect(() => {
    // Set up a single listener for all tables to avoid multiple listeners
    const setupRealtimeListener = async () => {
      try {
        // Create a single channel for all tables with optimized event handling
        const channel = supabase
          .channel('table-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'clients' },
            (payload: RealtimePayload) => {
              // Prevent duplicate events with improved deduplication logic
              const currentTime = Date.now();
              const payloadId = payload.new?.id || payload.old?.id;
              
              // Check if this is a duplicate event (same table+id within 500ms)
              if (lastProcessedRef.current && 
                  lastProcessedRef.current.table === 'clients' &&
                  lastProcessedRef.current.id === payloadId &&
                  currentTime - lastProcessedRef.current.timestamp < 500) {
                console.log("Skipping duplicate event");
                return;
              }
              
              // Update last processed
              lastProcessedRef.current = {
                table: 'clients',
                id: payloadId,
                timestamp: currentTime
              };
              
              console.log("Change detected in clients table:", payload);
              
              // Clear any existing debounce timer
              if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
              }
              
              // Debounce the fetch operation to avoid multiple fetches in quick succession
              if (!isProcessingRef.current) {
                debounceTimerRef.current = setTimeout(() => {
                  isProcessingRef.current = true;
                  
                  // Don't show error toasts for background updates
                  fetchClients(0, false).finally(() => {
                    isProcessingRef.current = false;
                  });
                  
                  // Invalidate related queries with minimal scope
                  queryClient.invalidateQueries({ queryKey: ['clients'] });
                  if (payload.new && 'id' in payload.new) {
                    queryClient.invalidateQueries({ queryKey: ['client', payload.new.id] });
                  }
                  
                  debounceTimerRef.current = null;
                }, 500); // Wait for a bit to catch multiple rapid changes
              }
            }
          )
          .subscribe((status) => {
            console.log("Realtime subscription status:", status);
          });

        // Ensure the channel is properly cleaned up when the component unmounts
        return () => {
          console.log("Removing realtime channel subscription");
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
          }
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Error setting up realtime listener:", error);
      }
    };

    const cleanup = setupRealtimeListener();
    return () => {
      if (cleanup) {
        cleanup.then(cleanupFn => {
          if (cleanupFn) cleanupFn();
        });
      }
    };
  }, [fetchClients, queryClient]);
};
