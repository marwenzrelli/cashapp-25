
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Creates a test client with the specified ID if it doesn't exist already
 */
export const createClientIfNotExists = async (id: number = 1): Promise<boolean> => {
  try {
    console.log(`Checking if client with ID ${id} exists...`);
    
    // Check if client exists
    const { count, error: countError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('id', id);
      
    if (countError) {
      console.error("Error checking if client exists:", countError);
      return false;
    }
    
    if (count && count > 0) {
      console.log(`Client with ID ${id} already exists`);
      return true;
    }
    
    console.log(`Creating client with ID ${id}...`);
    
    // Create test client
    const { error } = await supabase
      .from('clients')
      .insert({
        id: id,
        nom: 'Nouveau',
        prenom: 'Client',
        email: 'client@example.com',
        telephone: '0123456789',
        solde: 1000,
        status: 'active'
      });
      
    if (error) {
      console.error("Error creating client:", error);
      toast.error("Erreur de création", {
        description: `Impossible de créer le client: ${error.message}`
      });
      return false;
    }
    
    toast.success("Client créé", {
      description: `Le client avec l'ID ${id} a été créé avec succès`
    });
    
    console.log(`Client with ID ${id} created successfully`);
    return true;
  } catch (error: any) {
    console.error("Error in createClientIfNotExists:", error);
    toast.error("Erreur inattendue", {
      description: error.message || "Une erreur est survenue lors de la création du client"
    });
    return false;
  }
};
