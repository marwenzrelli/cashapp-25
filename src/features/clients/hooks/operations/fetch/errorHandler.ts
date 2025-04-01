
import { showErrorToast, handleSupabaseError } from "../../utils/errorUtils";

/**
 * Handles errors during fetch operation
 */
export const handleFetchError = (
  error: any, 
  retry: number, 
  maxRetries: number, 
  errorNotified: boolean,
  showToast: boolean
): { 
  shouldRetry: boolean;
  errorMessage: string;
  errorNotified: boolean;
} => {
  console.error("Erreur critique lors du chargement des clients:", error);
  
  // Determine if we should retry
  const shouldRetry = retry < maxRetries;
  const errorMessage = handleSupabaseError(error);
  let updatedErrorNotified = errorNotified;
  
  // Show toast if requested and not already shown
  if (showToast && !errorNotified) {
    showErrorToast("Erreur de connexion", error);
    updatedErrorNotified = true;
  }
  
  return {
    shouldRetry,
    errorMessage,
    errorNotified: updatedErrorNotified
  };
};
