
import { toast } from "sonner";

export const validateToken = (token: string | undefined): { isValid: boolean; error: string | null } => {
  if (!token) {
    console.error("Missing access token");
    return { isValid: false, error: "Token d'accès manquant" };
  }

  // Accept both UUID format (36 chars) and short token format (10 chars)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const shortTokenRegex = /^[A-Z0-9]{10}$/;
  
  const isValidUUID = uuidRegex.test(token);
  const isValidShortToken = shortTokenRegex.test(token);
  
  if (!isValidUUID && !isValidShortToken) {
    console.error("Invalid token format:", token);
    return { isValid: false, error: "Format de token invalide ou token corrompu" };
  }

  console.log("Token format validation passed:", token);
  return { isValid: true, error: null };
};

export const validateTokenExpiration = (expires_at: string | null, created_at: string): { isValid: boolean; error: string | null } => {
  // If expires_at is null, it's a permanent token (no expiration)
  if (!expires_at) {
    console.log("Token has no expiration date (permanent token)");
    return { isValid: true, error: null };
  }

  try {
    // Check if token is expired
    const expirationDate = new Date(expires_at);
    const now = new Date();
    
    if (expirationDate < now) {
      console.error("Token expired:", { expires_at, now: now.toISOString() });
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

    console.log("Token expiration validation passed");
    return { isValid: true, error: null };
  } catch (error) {
    console.error("Error validating token expiration:", error);
    return { isValid: false, error: "Erreur lors de la validation de l'expiration du token" };
  }
};

export const validateClientStatus = (status: string): { isValid: boolean; error: string | null } => {
  if (!status) {
    console.error("Missing client status");
    return { isValid: false, error: "Statut client manquant" };
  }
  
  if (status === 'inactive' || status === 'suspended') {
    console.error("Client account is inactive or suspended:", status);
    return { isValid: false, error: "Ce compte client est désactivé ou suspendu" };
  }
  
  console.log("Client status validation passed:", status);
  return { isValid: true, error: null };
};
