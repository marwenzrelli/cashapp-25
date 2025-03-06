
import { supabase } from "@/integrations/supabase/client";
import { TokenData } from "./types";
import { validateTokenExpiration } from "./validation";
import { showErrorToast } from "../utils/errorUtils";

export const fetchAccessData = async (token: string): Promise<TokenData> => {
  try {
    console.log("Fetching access data for token:", token);
    const { data, error } = await supabase
      .from('qr_access')
      .select('client_id, expires_at, created_at')
      .eq('access_token', token)
      .maybeSingle();  // Using maybeSingle instead of single to handle not found case better

    if (error) {
      console.error("Supabase error fetching access data:", error);
      throw new Error(`Token d'accès invalide ou expiré: ${error.message}`);
    }

    if (!data) {
      console.error("No access data found for token:", token);
      throw new Error("Token d'accès non reconnu dans notre système");
    }

    if (!data.client_id) {
      console.error("No client ID associated with token:", token);
      throw new Error("Aucun client associé à ce token d'accès");
    }

    console.log("Access data found:", data);

    // Validate token expiration
    const expirationValidation = validateTokenExpiration(data.expires_at, data.created_at);
    if (!expirationValidation.isValid) {
      console.error("Token validation failed (expiration):", expirationValidation.error);
      throw new Error(expirationValidation.error || "Token expiré");
    }

    console.log("Successfully fetched and validated access data with client ID:", data.client_id);
    return data as TokenData;
  } catch (error: any) {
    console.error("Error in fetchAccessData:", error);
    throw error;
  }
};
