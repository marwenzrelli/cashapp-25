
import { Client } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRefreshClientBalance = (
  setClients: React.Dispatch<React.SetStateAction<Client[]>>
) => {
  // Fonction pour rafraîchir le solde d'un client
  const refreshClientBalance = async (id: number | string) => {
    try {
      // Assurer que l'id est un nombre
      const clientId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      console.log("Rafraîchissement du solde pour le client ID:", clientId);
      
      // Vérifier la connexion à Supabase
      if (!supabase) {
        throw new Error("La connexion à la base de données n'est pas disponible");
      }
      
      // Obtenir les informations du client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('prenom, nom')
        .eq('id', clientId)
        .single();
      
      if (clientError) {
        console.error("Erreur lors de la récupération du client:", clientError);
        return false;
      }
      
      if (!clientData) {
        console.error("Client non trouvé pour l'ID:", clientId);
        return false;
      }
      
      const clientFullName = `${clientData.prenom} ${clientData.nom}`;
      console.log("Nom complet du client:", clientFullName);
      
      // Obtenir le total des versements pour ce client
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('amount')
        .eq('client_name', clientFullName);
      
      if (depositsError) {
        console.error("Erreur lors de la récupération des versements:", depositsError);
        return false;
      }
      
      // Obtenir le total des retraits pour ce client
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('client_name', clientFullName);
      
      if (withdrawalsError) {
        console.error("Erreur lors de la récupération des retraits:", withdrawalsError);
        return false;
      }
      
      // Calculer le solde manuellement
      const totalDeposits = deposits?.reduce((acc, dep) => acc + Number(dep.amount), 0) || 0;
      const totalWithdrawals = withdrawals?.reduce((acc, wd) => acc + Number(wd.amount), 0) || 0;
      const balance = totalDeposits - totalWithdrawals;
      
      console.log(`Solde calculé pour ${clientFullName}: 
        Versements: ${totalDeposits}, 
        Retraits: ${totalWithdrawals}, 
        Solde final: ${balance}`);
      
      // Mettre à jour le solde dans la base de données
      const { error: updateError } = await supabase
        .from('clients')
        .update({ solde: balance })
        .eq('id', clientId);
      
      if (updateError) {
        console.error("Erreur lors de la mise à jour du solde:", updateError);
        toast.error("Erreur lors de la mise à jour du solde", {
          description: updateError.message
        });
        return false;
      }
      
      // Mettre à jour le client dans l'état local
      setClients(prevClients => 
        prevClients.map(client => 
          client.id === clientId ? { ...client, solde: balance } : client
        )
      );
      
      console.log(`Solde du client ${clientFullName} mis à jour avec succès: ${balance}`);
      return true;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du solde:", error);
      toast.error("Erreur lors du rafraîchissement du solde", {
        description: error instanceof Error ? error.message : "Erreur inconnue"
      });
      return false;
    }
  };

  return { refreshClientBalance };
};
