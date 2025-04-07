
import { useCallback } from "react";
import { toast } from "sonner";

export const useOperationsRefresh = (
  refreshOperations: (force: boolean) => Promise<void>,
  setIsLoading: (isLoading: boolean) => void
) => {
  // Function to refresh operations with UI feedback
  const refreshOperationsWithFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      await refreshOperations(true);
      toast.success("Opérations actualisées");
    } catch (error) {
      console.error("Erreur lors de l'actualisation des opérations:", error);
      toast.error("Erreur lors de l'actualisation des opérations");
    } finally {
      setIsLoading(false);
    }
  }, [refreshOperations, setIsLoading]);

  return {
    refreshOperationsWithFeedback
  };
};
