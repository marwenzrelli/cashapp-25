
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
    const operationToDelete = operation;
    return operationToDelete;
  };

  const confirmDeleteOperation = async (operationToDelete: Operation | undefined): Promise<boolean> => {
    if (!operationToDelete) return false;
    
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      console.log(`Début de la suppression de l'opération: ${operationToDelete.type} avec l'ID: ${operationToDelete.id}`);
      
      let success = false;
      
      switch (operationToDelete.type) {
        case "deposit":
          success = await handleDepositDeletion(operationToDelete.id, userId);
          break;
          
        case "withdrawal":
          success = await handleWithdrawalDeletion(operationToDelete.id, userId);
          break;
          
        case "transfer":
          success = await handleTransferDeletion(operationToDelete.id, userId);
          break;
      }
      
      if (success) {
        toast.success("Opération supprimée avec succès");
        await fetchAllOperations();
        return true;
      } else {
        throw new Error("Échec de la suppression de l'opération");
      }
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'opération:", error);
      toast.error("Erreur lors de la suppression de l'opération", {
        description: error.message || "Une erreur s'est produite lors de la suppression."
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteOperation,
    confirmDeleteOperation
  };
};
