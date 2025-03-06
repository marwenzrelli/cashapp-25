
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/features/clients/types";
import { validateClientStatus } from "./validation";

export const fetchClientDetails = async (clientId: number): Promise<Client> => {
  try {
    console.log("Fetching client details for ID:", clientId);
    
    if (!clientId || isNaN(Number(clientId))) {
      console.error("Invalid client ID:", clientId);
      throw new Error("Identifiant client invalide");
    }
    
    // Log the query we're about to execute for debugging
    console.log(`Executing query for client ID ${clientId}...`);
    
    // DETAILED DEBUGGING: First examine the entire clients table to see what exists
    const { data: allClients, error: listError } = await supabase
      .from('clients')
      .select('id, nom, prenom')
      .limit(10);
    
    if (listError) {
      console.error("Error listing clients:", listError);
    } else {
      console.log("Available clients in database:", allClients);
    }
    
    // First, check if client exists directly to provide better error messages
    const { count, error: countError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('id', clientId);
      
    if (countError) {
      console.error("Error checking if client exists:", countError);
      throw new Error(`Erreur lors de la vérification du client: ${countError.message}`);
    }
    
    console.log(`Count result for client ID ${clientId}: ${count}`);
    
    if (count === 0) {
      console.error(`No client exists with ID ${clientId}`);
      throw new Error(`Client introuvable dans notre système (ID: ${clientId})`);
    }
    
    // Now fetch the full client data
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .maybeSingle();  // Using maybeSingle instead of single

    if (error) {
      console.error("Error fetching client:", error);
      throw new Error(`Impossible de récupérer les données du client: ${error.message}`);
    }

    if (!data) {
      console.error("No client found with ID:", clientId);
      throw new Error(`Client introuvable dans notre système (ID: ${clientId})`);
    }

    // Validate client status
    const statusValidation = validateClientStatus(data.status);
    if (!statusValidation.isValid) {
      console.error("Client status validation failed:", statusValidation.error);
      throw new Error(statusValidation.error || "Statut client invalide");
    }

    console.log("Successfully fetched client data:", data);
    return data as Client;
  } catch (error: any) {
    console.error("Error in fetchClientDetails:", error);
    throw error;
  }
};
