
import { Client } from "../../types";
import { supabase } from "@/integrations/supabase/client";

export const useRefreshClientBalance = (
  setClients: React.Dispatch<React.SetStateAction<Client[]>>
) => {
  // Fonction pour rafraîchir le solde d'un client
  const refreshClientBalance = async (id: number) => {
    try {
      // Vérifier la connexion à Supabase
      if (!supabase) {
        throw new Error("La connexion à la base de données n'est pas disponible");
      }
      
      // Calculer le solde du client
      const { data: balance, error: balanceError } = await supabase
        .rpc('calculate_client_balance', { client_id: id });

      if (balanceError) {
        console.error("Erreur lors du calcul du solde:", balanceError);
        return;
      }

      // Mettre à jour le solde dans la base de données
      await supabase
        .from('clients')
        .update({ solde: balance || 0 })
        .eq('id', id);

      // Mettre à jour le client dans l'état local
      setClients(prevClients => 
        prevClients.map(client => 
          client.id === id ? { ...client, solde: balance || 0 } : client
        )
      );
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du solde:", error);
    }
  };

  return { refreshClientBalance };
};
