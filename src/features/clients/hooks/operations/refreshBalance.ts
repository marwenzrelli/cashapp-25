
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
      
      // Instead of RPC, which might not exist, we'll calculate the balance from transactions
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('amount')
        .eq('client_name', (await supabase.from('clients').select('prenom, nom').eq('id', id).single()).data?.prenom + ' ' + 
        (await supabase.from('clients').select('prenom, nom').eq('id', id).single()).data?.nom);
      
      if (depositsError) {
        console.error("Erreur lors de la récupération des versements:", depositsError);
        return;
      }

      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('client_name', (await supabase.from('clients').select('prenom, nom').eq('id', id).single()).data?.prenom + ' ' + 
        (await supabase.from('clients').select('prenom, nom').eq('id', id).single()).data?.nom);
      
      if (withdrawalsError) {
        console.error("Erreur lors de la récupération des retraits:", withdrawalsError);
        return;
      }

      // Calculate balance manually
      const totalDeposits = deposits?.reduce((acc, dep) => acc + Number(dep.amount), 0) || 0;
      const totalWithdrawals = withdrawals?.reduce((acc, wd) => acc + Number(wd.amount), 0) || 0;
      const balance = totalDeposits - totalWithdrawals;

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
