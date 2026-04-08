
import { Operation } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
import { logger } from "@/utils/logger";
  handleDepositDeletion, 
  handleWithdrawalDeletion, 
  handleTransferDeletion 
} from "../utils/deletionUtils";

export const useDeleteOperation = (
  fetchAllOperations: () => Promise<void>,
  setIsLoading: (isLoading: boolean) => void
) => {
  const deleteOperation = async (operation: Operation): Promise<Operation> => {
    logger.log("deleteOperation called with:", operation);
    return operation;
  };

  const confirmDeleteOperation = async (operationToDelete: Operation | undefined): Promise<boolean> => {
    logger.log("confirmDeleteOperation called with:", operationToDelete);
    
    if (!operationToDelete) {
      console.error("No operation selected for deletion");
      toast.error("Aucune opération sélectionnée");
      return false;
    }
    
    try {
      setIsLoading(true);
      logger.log("Setting isLoading to true");
      
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      logger.log("User ID from session:", userId);
      
      logger.log(`Starting deletion process for operation type: ${operationToDelete.type} with ID: ${operationToDelete.id}`);
      
      let success = false;
      
      // Extraire l'ID numérique de l'opération
      const operationIdParts = operationToDelete.id.toString().split('-');
      const operationIdString = operationIdParts.length > 1 ? operationIdParts[1] : operationIdParts[0];
      const operationId = parseInt(operationIdString, 10);
      
      if (isNaN(operationId)) {
        throw new Error(`ID d'opération invalide: ${operationToDelete.id}`);
      }
      
      logger.log(`Parsed operation ID: ${operationId}`);
      
      switch (operationToDelete.type) {
        case "deposit":
          logger.log("Handling deposit deletion");
          success = await handleDepositDeletion(operationId, userId);
          break;
          
        case "withdrawal":
          logger.log("Handling withdrawal deletion");
          success = await handleWithdrawalDeletion(operationId, userId);
          break;
          
        case "transfer":
          logger.log("Handling transfer deletion");
          success = await handleTransferDeletion(operationId, userId);
          break;
          
        default:
          console.error("Unknown operation type:", operationToDelete.type);
          throw new Error(`Type d'opération inconnu: ${operationToDelete.type}`);
      }
      
      logger.log("Deletion success:", success);
      
      if (success) {
        logger.log("Operation deleted successfully, refreshing operations list");
        toast.success("Opération supprimée avec succès");
        
        // Attendre un court instant pour s'assurer que la suppression est terminée côté serveur
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Rafraîchir la liste des opérations
        await fetchAllOperations();
        
        return true;
      } else {
        throw new Error("Échec de la suppression de l'opération");
      }
    } catch (error: any) {
      console.error("Error during operation deletion:", error);
      toast.error("Erreur lors de la suppression de l'opération", {
        description: error.message || "Une erreur s'est produite lors de la suppression."
      });
      return false;
    } finally {
      logger.log("Setting isLoading to false");
      setIsLoading(false);
    }
  };

  return {
    deleteOperation,
    confirmDeleteOperation
  };
};
