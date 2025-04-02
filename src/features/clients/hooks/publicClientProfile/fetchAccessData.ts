
import { TokenData } from "./types";
import { supabase } from "@/integrations/supabase/client";

export const fetchAccessData = async (token: string): Promise<TokenData> => {
  try {
    // Set a shorter timeout for this specific query
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout
    
    // Use the signal in the fetch options for the Supabase client
    const { data, error } = await supabase
      .from('qr_access')
      .select('*')
      .eq('access_token', token)
      .single()
      .abortSignal(controller.signal);

    // Clear the timeout
    clearTimeout(timeoutId);

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - "not found" error
        throw new Error("Token d'accès invalide ou expiré");
      } else {
        throw new Error(`Erreur d'accès: ${error.message}`);
      }
    }

    if (!data) {
      throw new Error("Token d'accès invalide ou expiré");
    }

    return {
      client_id: data.client_id,
      expires_at: data.expires_at,
      created_at: data.created_at
    } as TokenData;
  } catch (error: any) {
    console.error("Error fetching access data:", error);
    
    // More specific error handling
    if (error.name === 'AbortError') {
      throw new Error("Délai d'attente dépassé lors de la vérification du token");
    }
    
    throw new Error(error.message || "Erreur lors de la validation du token");
  }
};
