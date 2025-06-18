
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
    const fetchPromise = async () => {
      const response = await supabase
        .from('qr_access')
        .select('*')
        .eq('access_token', token)
        .single();
        
      return response;
    };
      
    // Utiliser Promise.race pour implémenter le timeout
    const result = await Promise.race([
      fetchPromise(),
      timeoutPromise
    ]);

    // Maintenant result contient la réponse de Supabase correctement typée
    if (result.error) {
      if (result.error.code === 'PGRST116') {
        // No rows returned - "not found" error
        throw new Error("Token d'accès invalide ou expiré");
      } else {
        throw new Error(`Erreur d'accès: ${result.error.message}`);
      }
    }

    if (!result.data) {
      throw new Error("Token d'accès invalide ou expiré");
    }

    return {
      client_id: result.data.client_id,
      access_token: token, // Include the token that was used to fetch the data
      expires_at: result.data.expires_at
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
