
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
    console.log(`Starting deleteDeposit with ID: ${depositId} (type: ${typeof depositId})`);
    
    if (!depositId || isNaN(depositId) || depositId <= 0) {
      console.error("Invalid deposit ID:", depositId);
      toast.error("ID de versement invalide");
      return false;
    }
    
    try {
      setIsLoading(true);
      console.log("Setting isLoading to true for deletion");

      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      console.log("User ID for deletion:", userId);

      // Use the centralized deletion utility
      const success = await handleDepositDeletion(depositId, userId);
      
      if (success) {
        console.log("Deletion successful, updating local state");
        // Update the local state by removing the deleted deposit
        setDeposits(prevDeposits => {
          const filtered = prevDeposits.filter(deposit => {
            const currentId = typeof deposit.id === 'string' ? parseInt(deposit.id, 10) : deposit.id;
            return currentId !== depositId;
          });
          console.log(`Filtered deposits: ${prevDeposits.length} -> ${filtered.length}`);
          return filtered;
        });
        
        toast.success("Versement supprimé avec succès");
        return true;
      } else {
        console.error("Deletion failed");
        toast.error("Échec de la suppression");
        return false;
      }
    } catch (error) {
      console.error("Error during deleteDeposit:", error);
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
      toast.error("Aucun versement sélectionné");
      return false;
    }
    
    try {
      // Extract numeric ID from deposit with explicit type handling
      let depositId: number;
      
      // Use type assertion to handle the ID properly
      const rawId = depositToDelete.id as string | number;
      
      if (typeof rawId === 'string') {
        // Handle string IDs that might be in format "123" or "dep-123"
        const cleanId = rawId.replace(/[^\d]/g, '');
        depositId = parseInt(cleanId, 10);
      } else if (typeof rawId === 'number') {
        depositId = rawId;
      } else {
        console.error("Invalid deposit ID type:", typeof rawId, rawId);
        toast.error("Type d'ID invalide");
        return false;
      }
      
      if (isNaN(depositId) || depositId <= 0) {
        console.error("Invalid deposit ID format:", depositToDelete.id);
        toast.error("Format d'ID invalide");
        return false;
      }
      
      console.log(`Attempting to delete deposit with ID: ${depositId}`);
      
      const result = await deleteDeposit(depositId);
      console.log("Delete operation result:", result);
      
      if (result) {
        console.log("Successful deletion, clearing state");
        setDepositToDelete(null);
        setShowDeleteDialog(false);
        return true;
      } else {
        console.error("Deletion failed");
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
