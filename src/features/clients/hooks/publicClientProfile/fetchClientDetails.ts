
import { Client } from "@/features/clients/types";
import { supabase } from "@/integrations/supabase/client";

export const fetchClientDetails = async (clientId: number): Promise<Client> => {
  try {
    // Set a shorter timeout for this specific query
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single({
        signal: controller.signal // Pass the signal as an option to single()
      });

    // Clear the timeout
    clearTimeout(timeoutId);

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error("Client introuvable");
      } else {
        throw new Error(`Erreur lors de la récupération des détails du client: ${error.message}`);
      }
    }

    if (!data) {
      throw new Error("Client introuvable");
    }

    return data as Client;
  } catch (error: any) {
    console.error("Error fetching client details:", error);
    
    // More specific error handling
    if (error.name === 'AbortError') {
      throw new Error("Délai d'attente dépassé lors de la récupération des détails client");
    }
    
    throw new Error(error.message || "Client introuvable");
  }
};
