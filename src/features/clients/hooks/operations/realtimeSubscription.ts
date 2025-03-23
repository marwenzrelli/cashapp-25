
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
  
  // Configurer un écouteur de changements en temps réel unique et global pour éviter les multiples écouteurs
  useEffect(() => {
    // Configurer un seul écouteur pour toutes les tables
    const setupRealtimeListener = async () => {
      try {
        // Créer un seul canal pour toutes les tables
        const channel = supabase
          .channel('table-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'clients' },
            (payload: RealtimePayload) => {
              // Prevent duplicate events
              const currentTime = Date.now();
              const payloadId = payload.new?.id || payload.old?.id;
              
              // Check if this is a duplicate event (same table+id within 500ms)
              if (lastProcessedRef.current && 
                  lastProcessedRef.current.table === 'clients' &&
                  lastProcessedRef.current.id === payloadId &&
                  currentTime - lastProcessedRef.current.timestamp < 500) {
                return;
              }
              
              // Update last processed
              lastProcessedRef.current = {
                table: 'clients',
                id: payloadId,
                timestamp: currentTime
              };
              
              console.log("Changement détecté dans la table clients:", payload);
              // Utiliser showToast=false pour éviter de montrer des toasts d'erreur répétés
              fetchClients(0, false);
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
              
              // Check if this is a duplicate event (same table+id within 500ms)
              if (lastProcessedRef.current && 
                  lastProcessedRef.current.table === 'deposits' &&
                  lastProcessedRef.current.id === payloadId &&
                  currentTime - lastProcessedRef.current.timestamp < 500) {
                return;
              }
              
              // Update last processed
              lastProcessedRef.current = {
                table: 'deposits',
                id: payloadId,
                timestamp: currentTime
              };
              
              console.log("Changement détecté dans la table deposits:", payload);
              fetchClients(0, false);
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
              
              // Check if this is a duplicate event (same table+id within 500ms)
              if (lastProcessedRef.current && 
                  lastProcessedRef.current.table === 'withdrawals' &&
                  lastProcessedRef.current.id === payloadId &&
                  currentTime - lastProcessedRef.current.timestamp < 500) {
                return;
              }
              
              // Update last processed
              lastProcessedRef.current = {
                table: 'withdrawals',
                id: payloadId,
                timestamp: currentTime
              };
              
              console.log("Changement détecté dans la table withdrawals:", payload);
              fetchClients(0, false);
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
              
              // Check if this is a duplicate event (same table+id within 500ms)
              if (lastProcessedRef.current && 
                  lastProcessedRef.current.table === 'transfers' &&
                  lastProcessedRef.current.id === payloadId &&
                  currentTime - lastProcessedRef.current.timestamp < 500) {
                return;
              }
              
              // Update last processed
              lastProcessedRef.current = {
                table: 'transfers',
                id: payloadId,
                timestamp: currentTime
              };
              
              console.log("Changement détecté dans la table transfers:", payload);
              fetchClients(0, false);
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

        // Nettoyer le canal au démontage du composant
        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Erreur lors de la configuration de l'écouteur en temps réel:", error);
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
