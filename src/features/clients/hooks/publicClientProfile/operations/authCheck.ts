
import { supabase } from "@/integrations/supabase/client";

export interface AccessCheckResult {
  clientId: number;
  isValid: boolean;
  error?: string;
}

export const validateTokenAccess = async (token: string): Promise<AccessCheckResult> => {
  try {
    const accessResult = await supabase
      .from('qr_access')
      .select('client_id')
      .eq('access_token', token)
      .maybeSingle();
      
    if (accessResult.error) {
      return {
        clientId: 0,
        isValid: false,
        error: `Erreur d'authentification: ${accessResult.error.message}`
      };
    }
    
    if (!accessResult.data) {
      return {
        clientId: 0,
        isValid: false,
        error: "Token d'accès invalide ou expiré"
      };
    }

    const clientId = accessResult.data.client_id;
    if (!clientId) {
      return {
        clientId: 0,
        isValid: false,
        error: "ID client manquant dans le token d'accès"
      };
    }
    
    return {
      clientId,
      isValid: true
    };
  } catch (error: any) {
    return {
      clientId: 0,
      isValid: false,
      error: `Erreur de validation: ${error.message}`
    };
  }
};
