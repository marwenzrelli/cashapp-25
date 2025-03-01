
import { supabase } from "@/integrations/supabase/client";
import { showSuccessToast, showErrorToast, handleSupabaseError } from "../utils/errorUtils";

export const useDeleteClient = (
  setClients: React.Dispatch<React.SetStateAction<any[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Fonction pour supprimer un client
  const deleteClient = async (id: number) => {
    try {
      setLoading(true);
      
      // Vérifier la connexion à Supabase
      if (!supabase) {
        throw new Error("La connexion à la base de données n'est pas disponible");
      }
      
      // Récupérer les informations du client avant de le supprimer
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('prenom, nom')
        .eq('id', id)
        .single();

      if (clientError) {
        console.error("Erreur lors de la récupération du client:", clientError);
        showErrorToast("Client introuvable", 
          "Impossible de trouver les informations du client."
        );
        return false;
      }

      const clientFullName = `${clientData.prenom} ${clientData.nom}`;
      
      // Utiliser une transaction batch pour supprimer le client et ses données associées en une seule opération
      // Cette approche est plus rapide car elle envoie toutes les requêtes en parallèle
      const promises = [
        // Supprimer les dépôts
        supabase.from('deposits').delete().eq('client_name', clientFullName),
        
        // Supprimer les retraits
        supabase.from('withdrawals').delete().eq('client_name', clientFullName),
        
        // Supprimer les transferts (from)
        supabase.from('transfers').delete().eq('from_client', clientFullName),
        
        // Supprimer les transferts (to)
        supabase.from('transfers').delete().eq('to_client', clientFullName),
        
        // Supprimer les accès QR
        supabase.from('qr_access').delete().eq('client_id', id),
      ];
      
      // Exécuter toutes les opérations de suppression en parallèle
      const results = await Promise.all(promises);
      
      // Vérifier s'il y a des erreurs dans les opérations
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.warn("Certaines opérations de suppression ont échoué:", errors);
        // Continuer quand même car des données peuvent avoir été supprimées
      }
      
      // Finalement, supprimer le client lui-même
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }
      
      // Mettre à jour l'état local
      setClients(prevClients => prevClients.filter(c => c.id !== id));
      
      showSuccessToast("Client supprimé", 
        `${clientFullName} a été supprimé avec succès.`
      );
      
      return true;
    } catch (error) {
      console.error("Erreur critique lors de la suppression du client:", error);
      showErrorToast("Erreur lors de la suppression", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteClient };
};
