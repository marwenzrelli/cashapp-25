
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Deposit } from "@/features/deposits/types";
import { handleDepositDeletion } from "@/features/operations/utils/deletionUtils";

export const useDeleteDeposit = (
  deposits: Deposit[],
  setDeposits: React.Dispatch<React.SetStateAction<Deposit[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  depositToDelete: Deposit | null,
  setDepositToDelete: React.Dispatch<React.SetStateAction<Deposit | null>>,
  setShowDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const deleteDeposit = async (depositId: number | string): Promise<boolean> => {
    console.log(`Calling deleteDeposit function with ID: ${depositId}`);
    
    try {
      setIsLoading(true);
      console.log("Setting isLoading to true");

      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      console.log("Got user ID from session:", userId);

      // Use the utility function to handle deletion
      console.log("Calling handleDepositDeletion utility function");
      const result = await handleDepositDeletion(depositId, userId);
      console.log("Deposit deletion result:", result);
      
      if (result === true) {
        console.log("Deletion was successful, updating UI state");
        // Convert the ID to a number for filtering if it's a string
        const numericId = typeof depositId === 'string' ? parseInt(depositId, 10) : depositId;
        
        // Update the deposits state by filtering out the deleted deposit
        setDeposits(prevDeposits => {
          console.log("Current deposits before filter:", prevDeposits.length);
          const newDeposits = prevDeposits.filter(deposit => deposit.id !== numericId);
          console.log("New deposits after filter:", newDeposits.length);
          return newDeposits;
        });
        
        return true;
      } else {
        console.error("Deletion failed but no error was thrown");
        return false;
      }
    } catch (error) {
      console.error("Error during deleteDeposit function:", error);
      throw error; // Re-throw to be handled by caller
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
      // Make sure we're working with a valid deposit ID
      const depositId = depositToDelete.id;
      console.log("Attempting to delete deposit with ID:", depositId);
      
      const result = await deleteDeposit(depositId);
      console.log("Delete operation completed with result:", result);
      
      if (result) {
        console.log("Successful deletion, clearing state and closing dialog");
        // Clear the depositToDelete state and close the dialog after a successful deletion
        setDepositToDelete(null);
        setShowDeleteDialog(false);
        return true;
      } else {
        console.error("Deletion returned false without throwing an error");
        toast.error("La suppression n'a pas pu être effectuée");
        return false;
      }
    } catch (error) {
      console.error("Error in confirmDeleteDeposit:", error);
      toast.error("Erreur lors de la suppression du versement", {
        description: error instanceof Error ? error.message : "Une erreur inconnue est survenue"
      });
      return false;
    }
  };

  return { deleteDeposit, confirmDeleteDeposit };
};
