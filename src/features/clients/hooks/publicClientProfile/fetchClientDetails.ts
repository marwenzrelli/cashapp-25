
import { Client } from "@/features/clients/types";
import { supabase } from "@/integrations/supabase/client";

export const fetchClientDetails = async (clientId: number): Promise<Client> => {
  try {
    console.log(`Récupération des détails du client avec l'ID: ${clientId}`);
    
    // Utiliser une promesse avec timeout au lieu de AbortController
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Délai d'attente dépassé")), 8000); // 8 secondes timeout
    });
    
    // La requête principale
    const fetchPromise = async () => {
      const response = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
        
      return response;
    };
      
    // Utiliser Promise.race pour implémenter le timeout
    const result = await Promise.race([
      fetchPromise(),
      timeoutPromise
    ]);

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        throw new Error("Client introuvable");
      } else {
        throw new Error(`Erreur lors de la récupération des détails du client: ${result.error.message}`);
      }
    }

    if (!result.data) {
      throw new Error("Client introuvable");
    }

    return result.data as Client;
  } catch (error: any) {
    console.error("Error fetching client details:", error);
    
    // Plus d'informations de diagnostic
    if (error.name === 'AbortError' || error.message.includes('délai') || error.message.includes('Délai')) {
      console.error("Timeout détecté pendant la récupération des données");
      throw new Error("Délai d'attente dépassé lors de la récupération des détails client");
    }
    
    throw new Error(error.message || "Client introuvable");
  }
};
