
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseClientSubscriptionProps {
  fetchClients: () => void;
}

export const useClientSubscription = ({ fetchClients }: UseClientSubscriptionProps) => {
  useEffect(() => {
    const channel = supabase
      .channel('public:clients')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        () => {
          console.log('Mise à jour des soldes détectée');
          fetchClients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchClients]);
};
