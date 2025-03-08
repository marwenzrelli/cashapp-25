
import { Operation } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  handleDepositDeletion, 
  handleWithdrawalDeletion, 
  handleTransferDeletion 
} from "../utils/deletionUtils";

export const useDeleteOperation = (
  fetchAllOperations: () => Promise<void>,
  setIsLoading: (isLoading: boolean) => void
) => {
  const deleteOperation = async (operation: Operation): Promise<Operation> => {
    console.log("deleteOperation called with:", operation);
    return operation;
  };

  const confirmDeleteOperation = async (operationToDelete: Operation | undefined): Promise<boolean> => {
    console.log("confirmDeleteOperation called with:", operationToDelete);
    
    if (!operationToDelete) {
      console.error("No operation selected for deletion");
      toast.error("Aucune opération sélectionnée");
      return false;
    }
    
    try {
      setIsLoading(true);
      console.log("Setting isLoading to true");
      
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      console.log("User ID from session:", userId);
      
      console.log(`Starting deletion process for operation type: ${operationToDelete.type} with ID: ${operationToDelete.id}`);
      
      let success = false;
      
      switch (operationToDelete.type) {
        case "deposit":
          console.log("Handling deposit deletion");
          success = await handleDepositDeletion(operationToDelete.id, userId);
          break;
          
        case "withdrawal":
          console.log("Handling withdrawal deletion");
          success = await handleWithdrawalDeletion(operationToDelete.id, userId);
          break;
          
        case "transfer":
          console.log("Handling transfer deletion");
          success = await handleTransferDeletion(operationToDelete.id, userId);
          break;
          
        default:
          console.error("Unknown operation type:", operationToDelete.type);
          throw new Error(`Type d'opération inconnu: ${operationToDelete.type}`);
      }
      
      console.log("Deletion success:", success);
      
      if (success) {
        console.log("Operation deleted successfully, refreshing operations list");
        toast.success("Opération supprimée avec succès");
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
      console.log("Setting isLoading to false");
      setIsLoading(false);
    }
  };

  return {
    deleteOperation,
    confirmDeleteOperation
  };
};
