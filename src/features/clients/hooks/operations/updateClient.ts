
import { Client } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { showSuccessToast, showErrorToast } from "../utils/errorUtils";

export const useUpdateClient = (
  setClients: React.Dispatch<React.SetStateAction<Client[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Fonction pour mettre à jour un client existant
  const updateClient = async (id: number, client: Partial<Client>) => {
    try {
      setLoading(true);
      
      // Vérifier la connexion à Supabase
      if (!supabase) {
        throw new Error("La connexion à la base de données n'est pas disponible");
      }
      
      // Validation for name fields
      if (client.nom !== undefined && client.nom.trim() === '') {
        showErrorToast("Validation échouée", "Le nom du client ne peut pas être vide");
        return false;
      }
      
      if (client.prenom !== undefined && client.prenom.trim() === '') {
        showErrorToast("Validation échouée", "Le prénom du client ne peut pas être vide");
        return false;
      }
      
      // Mettre à jour le client
      const { error } = await supabase
        .from('clients')
        .update(client)
        .eq('id', id);

      if (error) {
        console.error("Erreur lors de la mise à jour du client:", error);
        showErrorToast("Erreur lors de la mise à jour", error);
        return false;
      }

      // Mettre à jour le client dans l'état local
      setClients(prevClients => 
        prevClients.map(c => c.id === id ? { ...c, ...client } : c)
      );
      
      showSuccessToast("Client mis à jour", 
        "Les informations ont été enregistrées avec succès."
      );
      
      return true;
    } catch (error) {
      console.error("Erreur critique lors de la mise à jour du client:", error);
      showErrorToast("Erreur lors de la mise à jour", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateClient };
};
