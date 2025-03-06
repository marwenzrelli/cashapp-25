
import { toast } from "sonner";

// Fonction utilitaire pour traiter les erreurs
export const handleSupabaseError = (error: any) => {
  console.error("Erreur Supabase:", error);
  
  if (error.message?.includes("Failed to fetch")) {
    return "Problème de connexion réseau. Veuillez vérifier votre connexion internet.";
  }
  
  if (error.message?.includes("JWT")) {
    return "Session expirée. Veuillez vous reconnecter.";
  }
  
  if (error.message?.includes("Token")) {
    return error.message;
  }
  
  if (error.message?.includes("client")) {
    return error.message;
  }
  
  return error.message || "Une erreur inattendue s'est produite";
};

// Helper to show error toast
export const showErrorToast = (title: string, error: any) => {
  toast.error(title, {
    description: handleSupabaseError(error)
  });
};

// Helper to show success toast
export const showSuccessToast = (title: string, description: string) => {
  toast.success(title, {
    description
  });
};
