
import { TokenData } from "./types";
import { supabase } from "@/integrations/supabase/client";

export const fetchAccessData = async (token: string): Promise<TokenData> => {
  try {
    console.log(`Vérification du token d'accès: ${token.substring(0, 8)}...`);
    
    // Utiliser une promesse avec timeout au lieu de AbortController
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Délai d'attente dépassé")), 8000); // 8 secondes timeout
    });
    
    // La requête principale
    const fetchPromise = supabase
      .from('qr_access')
      .select('*')
      .eq('access_token', token)
      .single();
      
    // Utiliser Promise.race pour implémenter le timeout
    const { data, error } = await Promise.race([
      fetchPromise,
      timeoutPromise.then(() => {
        throw new Error("Délai d'attente dépassé lors de la vérification du token");
      })
    ]) as typeof fetchPromise;

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
    
    // Plus d'informations de diagnostic
    if (error.name === 'AbortError' || error.message.includes('délai') || error.message.includes('Délai')) {
      console.error("Timeout détecté pendant la récupération des données");
      throw new Error("Délai d'attente dépassé lors de la vérification du token");
    }
    
    throw new Error(error.message || "Erreur lors de la validation du token");
  }
};
