
import { toast } from "sonner";

// Fonction utilitaire pour traiter les erreurs
export const handleSupabaseError = (error: any) => {
  console.error("Erreur Supabase détaillée:", error);
  
  // Check for network errors
  if (error.message?.includes("Failed to fetch") || 
      error.message?.includes("Network Error") || 
      error.message?.includes("network") ||
      !navigator.onLine) {
    return "Problème de connexion réseau. Veuillez vérifier votre connexion internet.";
  }
  
  // Check for JWT/authentication errors
  if (error.message?.includes("JWT") || 
      error.message?.includes("auth") || 
      error.message?.includes("Authentication")) {
    return "Session expirée. Veuillez vous reconnecter.";
  }
  
  // Check for expired QR code errors
  if (error.message?.includes("expir")) {
    return "Le lien a expiré";
  }
  
  // Check for not found errors
  if (error.message?.includes("trouvé") || 
      error.message?.includes("found") || 
      error.message?.includes("null")) {
    return "Information introuvable. Veuillez vérifier le lien ou contactez l'administrateur.";
  }
  
  // Return generic message with error details for debugging
  return error.message || "Une erreur inattendue s'est produite";
};

// Helper to show error toast
export const showErrorToast = (title: string, error: any) => {
  const errorMessage = handleSupabaseError(error);
  console.error(`${title}: ${errorMessage}`);
  
  toast.error(title, {
    description: errorMessage
  });
};

// Helper to show success toast
export const showSuccessToast = (title: string, description: string) => {
  toast.success(title, {
    description
  });
};
