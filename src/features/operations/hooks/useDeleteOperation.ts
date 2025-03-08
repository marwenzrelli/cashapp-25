
import { useState } from "react";
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
  const [operationToDelete, setOperationToDelete] = useState<Operation | null>(null);
  
  const deleteOperation = async (operation: Operation) => {
    setOperationToDelete(operation);
    return operation;
  };

  const confirmDeleteOperation = async (operationToDelete: Operation | undefined) => {
    if (!operationToDelete) {
      console.log("No operation selected for deletion");
      return false;
    }
    
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      console.log(`Début de la suppression de l'opération: ${operationToDelete.type} avec l'ID: ${operationToDelete.id}`);
      console.log("Type de l'ID:", typeof operationToDelete.id);
      
      switch (operationToDelete.type) {
        case "deposit":
          await handleDepositDeletion(operationToDelete.id, userId);
          break;
          
        case "withdrawal":
          await handleWithdrawalDeletion(operationToDelete.id, userId);
          break;
          
        case "transfer":
          await handleTransferDeletion(operationToDelete.id, userId);
          break;
      }
      
      toast.success("Opération supprimée avec succès");
      await fetchAllOperations();
      setOperationToDelete(null);
      return true;
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
    operationToDelete,
    deleteOperation,
    confirmDeleteOperation
  };
};
