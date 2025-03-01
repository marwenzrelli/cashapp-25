
import { Client } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { showSuccessToast, showErrorToast, handleSupabaseError } from "../utils/errorUtils";

export const useCreateClient = (
  setClients: React.Dispatch<React.SetStateAction<Client[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchClients: () => Promise<void>
) => {
  // Fonction pour créer un nouveau client
  const createClient = async (newClient: Omit<Client, "id" | "date_creation">) => {
    try {
      setLoading(true);
      
      // Vérifier la connexion à Supabase
      if (!supabase) {
        throw new Error("La connexion à la base de données n'est pas disponible");
      }
      
      // Récupérer l'ID de l'utilisateur actuel ou utiliser un ID par défaut pour le développement
      let userId = "dev-user-id";
      
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn("Erreur de session:", sessionError);
        } else if (sessionData?.session?.user?.id) {
          userId = sessionData.session.user.id;
        }
      } catch (sessionError) {
        console.warn("Impossible de récupérer la session:", sessionError);
      }
      
      // Créer le client
      const { data, error } = await supabase
        .from('clients')
        .insert([{ 
          ...newClient, 
          created_by: userId,
          date_creation: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la création du client:", error);
        showErrorToast("Erreur lors de la création", error);
        return false;
      }

      // Ajouter le nouveau client à l'état local
      setClients(prevClients => [data, ...prevClients]);
      
      showSuccessToast("Client créé avec succès", 
        `${newClient.prenom} ${newClient.nom} a été ajouté.`
      );
      
      return true;
    } catch (error) {
      console.error("Erreur critique lors de la création du client:", error);
      showErrorToast("Erreur lors de la création du client", error);
      return false;
    } finally {
      setLoading(false);
      
      // Rafraîchir la liste complète en arrière-plan
      setTimeout(() => fetchClients(), 1000);
    }
  };

  return { createClient };
};
