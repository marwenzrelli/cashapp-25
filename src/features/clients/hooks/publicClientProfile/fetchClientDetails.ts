
import { Client } from "@/features/clients/types";
import { supabase } from "@/integrations/supabase/client";

export const fetchClientDetails = async (clientId: number): Promise<Client> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (error) {
      throw new Error(`Erreur lors de la récupération des détails du client: ${error.message}`);
    }

    if (!data) {
      throw new Error("Client introuvable");
    }

    return data as Client;
  } catch (error: any) {
    console.error("Error fetching client details:", error);
    throw new Error(error.message || "Client introuvable");
  }
};
