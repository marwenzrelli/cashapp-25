
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
              
              // Check if this is a duplicate event (same table+id within 300ms)
              if (lastProcessedRef.current && 
                  lastProcessedRef.current.table === 'clients' &&
                  lastProcessedRef.current.id === payloadId &&
                  currentTime - lastProcessedRef.current.timestamp < 300) {
                return;
              }
              
              // Update last processed
              lastProcessedRef.current = {
                table: 'clients',
                id: payloadId,
                timestamp: currentTime
              };
              
              console.log("Change detected in clients table:", payload);
              
              // Use a more efficient approach by only refreshing data when needed
              // Don't show error toasts for background updates
              setTimeout(() => fetchClients(0, false), 100);
              
              // Invalidate related queries with minimal scope
              queryClient.invalidateQueries({ queryKey: ['clients'] });
              if (payload.new && 'id' in payload.new) {
                queryClient.invalidateQueries({ queryKey: ['client', payload.new.id] });
              }
            }
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'deposits' },
            (payload: RealtimePayload) => {
              // Apply same optimization pattern for deposits
              const currentTime = Date.now();
              const payloadId = payload.new?.id || payload.old?.id;
              
              if (lastProcessedRef.current && 
                  lastProcessedRef.current.table === 'deposits' &&
                  lastProcessedRef.current.id === payloadId &&
                  currentTime - lastProcessedRef.current.timestamp < 300) {
                return;
              }
              
              lastProcessedRef.current = {
                table: 'deposits',
                id: payloadId,
                timestamp: currentTime
              };
              
              console.log("Change detected in deposits table:", payload);
              
              // Delay fetch to allow batching of multiple changes
              setTimeout(() => fetchClients(0, false), 200);
              
              // Targeted query invalidation
              queryClient.invalidateQueries({ queryKey: ['deposits'] });
              if (payload.new && 'client_name' in payload.new) {
                queryClient.invalidateQueries({ queryKey: ['clients'] });
              }
            }
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'withdrawals' },
            (payload: RealtimePayload) => {
              // Apply same optimization pattern for withdrawals
              const currentTime = Date.now();
              const payloadId = payload.new?.id || payload.old?.id;
              
              if (lastProcessedRef.current && 
                  lastProcessedRef.current.table === 'withdrawals' &&
                  lastProcessedRef.current.id === payloadId &&
                  currentTime - lastProcessedRef.current.timestamp < 300) {
                return;
              }
              
              lastProcessedRef.current = {
                table: 'withdrawals',
                id: payloadId,
                timestamp: currentTime
              };
              
              console.log("Change detected in withdrawals table:", payload);
              
              // Delay fetch to allow batching of multiple changes
              setTimeout(() => fetchClients(0, false), 200);
              
              // Targeted query invalidation
              queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
              if (payload.new && 'client_name' in payload.new) {
                queryClient.invalidateQueries({ queryKey: ['clients'] });
              }
            }
          )
          .subscribe((status) => {
            console.log("Realtime subscription status:", status);
          });

        // Ensure the channel is properly cleaned up when the component unmounts
        return () => {
          console.log("Removing realtime channel subscription");
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
