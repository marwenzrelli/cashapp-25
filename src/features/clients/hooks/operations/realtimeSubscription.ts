
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
  
  // Prevent multiple rapid fetches
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscribedRef = useRef(false);
  
  // Configure a single global real-time listener to avoid multiple listeners
  useEffect(() => {
    // Only set up the subscription once
    if (subscribedRef.current) {
      return () => {};
    }
    
    subscribedRef.current = true;
    
    // Throttled fetch function to prevent multiple rapid fetches
    const throttledFetch = () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
      
      throttleTimeoutRef.current = setTimeout(() => {
        console.log("Throttled fetchClients triggered by realtime update");
        fetchClients(0, false).catch(err => {
          console.error("Error in throttled fetchClients:", err);
        });
        throttleTimeoutRef.current = null;
      }, 1000); // 1 second throttle
    };
    
    // Setup a single listener for all tables
    const setupRealtimeListener = async () => {
      try {
        // Create a single channel for all tables
        const channel = supabase
          .channel('table-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'clients' },
            (payload: RealtimePayload) => {
              // Prevent duplicate events
              const currentTime = Date.now();
              const payloadId = payload.new?.id || payload.old?.id;
              
              // Check if this is a duplicate event (same table+id within 1000ms)
              if (lastProcessedRef.current && 
                  lastProcessedRef.current.table === 'clients' &&
                  lastProcessedRef.current.id === payloadId &&
                  currentTime - lastProcessedRef.current.timestamp < 1000) {
                return;
              }
              
              // Update last processed
              lastProcessedRef.current = {
                table: 'clients',
                id: payloadId,
                timestamp: currentTime
              };
              
              console.log("Changement détecté dans la table clients:", payload);
              throttledFetch();
              // Invalidate related queries
              queryClient.invalidateQueries({ queryKey: ['clients'] });
              if (payload.new && 'id' in payload.new) {
                queryClient.invalidateQueries({ queryKey: ['client', payload.new.id] });
                queryClient.invalidateQueries({ queryKey: ['clientOperations', payload.new.id] });
              }
            }
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'deposits' },
            (payload: RealtimePayload) => {
              // Prevent duplicate events
              const currentTime = Date.now();
              const payloadId = payload.new?.id || payload.old?.id;
              
              // Check if this is a duplicate event (same table+id within 1000ms)
              if (lastProcessedRef.current && 
                  lastProcessedRef.current.table === 'deposits' &&
                  lastProcessedRef.current.id === payloadId &&
                  currentTime - lastProcessedRef.current.timestamp < 1000) {
                return;
              }
              
              // Update last processed
              lastProcessedRef.current = {
                table: 'deposits',
                id: payloadId,
                timestamp: currentTime
              };
              
              console.log("Changement détecté dans la table deposits:", payload);
              throttledFetch();
              // Invalidate deposits and operations queries
              queryClient.invalidateQueries({ queryKey: ['deposits'] });
              queryClient.invalidateQueries({ queryKey: ['operations'] });
              // Also refresh client data if the client_name is available
              if (payload.new && 'client_name' in payload.new) {
                queryClient.invalidateQueries({ queryKey: ['clients'] });
              }
            }
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'withdrawals' },
            (payload: RealtimePayload) => {
              // Prevent duplicate events
              const currentTime = Date.now();
              const payloadId = payload.new?.id || payload.old?.id;
              
              // Check if this is a duplicate event (same table+id within 1000ms)
              if (lastProcessedRef.current && 
                  lastProcessedRef.current.table === 'withdrawals' &&
                  lastProcessedRef.current.id === payloadId &&
                  currentTime - lastProcessedRef.current.timestamp < 1000) {
                return;
              }
              
              // Update last processed
              lastProcessedRef.current = {
                table: 'withdrawals',
                id: payloadId,
                timestamp: currentTime
              };
              
              console.log("Changement détecté dans la table withdrawals:", payload);
              throttledFetch();
              // Invalidate withdrawals and operations queries
              queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
              queryClient.invalidateQueries({ queryKey: ['operations'] });
              // Also refresh client data if the client_name is available
              if (payload.new && 'client_name' in payload.new) {
                queryClient.invalidateQueries({ queryKey: ['clients'] });
              }
            }
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'transfers' },
            (payload: RealtimePayload) => {
              // Prevent duplicate events
              const currentTime = Date.now();
              const payloadId = payload.new?.id || payload.old?.id;
              
              // Check if this is a duplicate event (same table+id within 1000ms)
              if (lastProcessedRef.current && 
                  lastProcessedRef.current.table === 'transfers' &&
                  lastProcessedRef.current.id === payloadId &&
                  currentTime - lastProcessedRef.current.timestamp < 1000) {
                return;
              }
              
              // Update last processed
              lastProcessedRef.current = {
                table: 'transfers',
                id: payloadId,
                timestamp: currentTime
              };
              
              console.log("Changement détecté dans la table transfers:", payload);
              throttledFetch();
              // Invalidate transfers and operations queries
              queryClient.invalidateQueries({ queryKey: ['transfers'] });
              queryClient.invalidateQueries({ queryKey: ['operations'] });
              // Also refresh client data if from_client or to_client is available
              if (payload.new) {
                queryClient.invalidateQueries({ queryKey: ['clients'] });
              }
            }
          )
          .subscribe((status) => {
            console.log("Statut de l'abonnement réel-time:", status);
          });

        // Clean up the channel when the component unmounts
        return () => {
          console.log("Cleaning up realtime subscription");
          if (throttleTimeoutRef.current) {
            clearTimeout(throttleTimeoutRef.current);
            throttleTimeoutRef.current = null;
          }
          supabase.removeChannel(channel);
          subscribedRef.current = false;
        };
      } catch (error) {
        console.error("Erreur lors de la configuration de l'écouteur en temps réel:", error);
        subscribedRef.current = false;
        return () => {}; // Return empty function if setup fails
      }
    };

    const cleanupPromise = setupRealtimeListener();
    
    return () => {
      if (cleanupPromise) {
        cleanupPromise.then(cleanupFn => {
          if (cleanupFn) cleanupFn();
        }).catch(err => {
          console.error("Error during cleanup:", err);
        });
      }
      
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
      
      subscribedRef.current = false;
    };
  }, [fetchClients, queryClient]);
};
