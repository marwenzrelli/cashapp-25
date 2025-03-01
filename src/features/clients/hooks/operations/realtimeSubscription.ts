
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeSubscription = (fetchClients: (retry?: number, showToast?: boolean) => Promise<void>) => {
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
            (payload) => {
              console.log("Changement détecté dans la table clients:", payload);
              // Utiliser showToast=false pour éviter de montrer des toasts d'erreur répétés
              fetchClients(0, false);
            }
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'deposits' },
            (payload) => {
              console.log("Changement détecté dans la table deposits:", payload);
              fetchClients(0, false);
            }
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'withdrawals' },
            (payload) => {
              console.log("Changement détecté dans la table withdrawals:", payload);
              fetchClients(0, false);
            }
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'transfers' },
            (payload) => {
              console.log("Changement détecté dans la table transfers:", payload);
              fetchClients(0, false);
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
  }, [fetchClients]);
};
