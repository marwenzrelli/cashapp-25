
import { useEffect } from "react";
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
  
  // Configurer un écouteur de changements en temps réel unique et global pour éviter les multiples écouteurs
  useEffect(() => {
    // Configurer un seul écouteur pour tous les changements
    const setupRealtimeListener = async () => {
      try {
        // Créer un seul canal pour toutes les tables
        const channel = supabase
          .channel('table-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'clients' },
            (payload: RealtimePayload) => {
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
