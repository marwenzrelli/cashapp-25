
import { toast } from "sonner";

export const validateToken = (token: string | undefined): { isValid: boolean; error: string | null } => {
  if (!token) {
    return { isValid: false, error: "Token d'accès manquant" };
  }

  // Basic UUID format validation
  if (!token.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
    return { isValid: false, error: "Format de token invalide" };
  }

  return { isValid: true, error: null };
};

export const validateTokenExpiration = (expires_at: string | null, created_at: string): { isValid: boolean; error: string | null } => {
  // Check if token is expired
  if (expires_at && new Date(expires_at) < new Date()) {
    return { isValid: false, error: "Ce lien d'accès a expiré" };
  }

  // Token age check (optional security measure - tokens older than 90 days require renewal)
  const tokenCreationDate = new Date(created_at);
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  if (tokenCreationDate < ninetyDaysAgo && !expires_at) {
    // For permanent tokens, we still recommend renewal after 90 days
    console.warn("Token is older than 90 days");
    // We don't return an error here, just a warning
  }

  return { isValid: true, error: null };
};

export const validateClientStatus = (status: string): { isValid: boolean; error: string | null } => {
  if (status === 'inactive' || status === 'suspended') {
    return { isValid: false, error: "Ce compte client est désactivé ou suspendu" };
  }
  
  return { isValid: true, error: null };
};
