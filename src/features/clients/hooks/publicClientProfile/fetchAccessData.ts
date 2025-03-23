
import { TokenData } from "./types";
import { supabase } from "@/integrations/supabase/client";

export const fetchAccessData = async (token: string): Promise<TokenData> => {
  try {
    const { data, error } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      throw new Error(`Erreur d'accès: ${error.message}`);
    }

    if (!data) {
      throw new Error("Token d'accès invalide ou expiré");
    }

    return data as TokenData;
  } catch (error: any) {
    console.error("Error fetching access data:", error);
    throw new Error(error.message || "Erreur lors de la validation du token");
  }
};
