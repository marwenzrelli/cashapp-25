
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Deposit } from "@/features/deposits/types";
import { showErrorToast } from "@/features/clients/hooks/utils/errorUtils";
import { handleDepositDeletion } from "@/features/operations/utils/deletionUtils";

export const useDeleteDeposit = (
  deposits: Deposit[],
  setDeposits: React.Dispatch<React.SetStateAction<Deposit[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  depositToDelete: Deposit | null,
  setDepositToDelete: React.Dispatch<React.SetStateAction<Deposit | null>>,
  setShowDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const deleteDeposit = async (depositId: number): Promise<boolean> => {
    console.log(`Calling deleteDeposit function with ID: ${depositId} (type: ${typeof depositId})`);
    
    if (!depositId || isNaN(depositId) || depositId <= 0) {
      console.error("Invalid deposit ID:", depositId);
      toast.error("ID de versement invalide");
      return false;
    }
    
    try {
      setIsLoading(true);
      console.log("Setting isLoading to true");

      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      console.log("Got user ID from session:", userId);

      // Use the centralized deletion utility
      const success = await handleDepositDeletion(depositId, userId);
      
      if (success) {
        // Update the local state
        console.log("Updating local state after successful deletion");
        setDeposits(prevDeposits => {
          console.log("Current deposits before filter:", prevDeposits.length);
          const newDeposits = prevDeposits.filter(deposit => {
            const currentId = typeof deposit.id === 'string' ? parseInt(deposit.id, 10) : deposit.id;
            const result = currentId !== depositId;
            console.log(`Comparing deposit ID ${currentId} (${typeof currentId}) with ${depositId} (${typeof depositId}): keep = ${result}`);
            return result;
          });
          console.log("New deposits after filter:", newDeposits.length);
          return newDeposits;
        });
        
        toast.success("Versement supprimé avec succès");
        return true;
      } else {
        console.error("Deletion failed");
        toast.error("La suppression a échoué");
        return false;
      }
    } catch (error) {
      console.error("Error during deleteDeposit function:", error);
      showErrorToast("Erreur lors de la suppression du versement", error);
      return false;
    } finally {
      console.log("Setting isLoading to false");
      setIsLoading(false);
    }
  };

  const confirmDeleteDeposit = async (): Promise<boolean> => {
    console.log("confirmDeleteDeposit called with depositToDelete:", depositToDelete);
    
    if (!depositToDelete) {
      console.error("No deposit selected for deletion");
      toast.error("Aucun versement sélectionné pour la suppression");
      return false;
    }
    
    try {
      // Ensure we're working with a number type ID
      const depositId = typeof depositToDelete.id === 'string' 
        ? parseInt(depositToDelete.id, 10) 
        : depositToDelete.id;
      
      if (isNaN(depositId)) {
        console.error("Invalid deposit ID format:", depositToDelete.id);
        toast.error("Format d'ID invalide");
        return false;
      }
      
      console.log("Attempting to delete deposit with ID:", depositId, "type:", typeof depositId);
      
      const result = await deleteDeposit(depositId);
      console.log("Delete operation completed with result:", result);
      
      if (result) {
        console.log("Successful deletion, clearing state");
        // Clear the depositToDelete state after a successful deletion
        setDepositToDelete(null);
        setShowDeleteDialog(false);
        return true;
      } else {
        console.error("Deletion returned false");
        toast.error("La suppression n'a pas pu être effectuée");
        return false;
      }
    } catch (error) {
      console.error("Error in confirmDeleteDeposit:", error);
      showErrorToast("Échec de la suppression du versement", error);
      return false;
    }
  };

  return { deleteDeposit, confirmDeleteDeposit };
};
