
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Deposit } from "@/features/deposits/types";

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
    
    if (isNaN(depositId) || depositId <= 0) {
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

      // First, fetch the deposit to be deleted
      console.log(`Fetching deposit with ID ${depositId} for archiving`);
      const { data: depositData, error: fetchError } = await supabase
        .from('deposits')
        .select('*')
        .eq('id', depositId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching deposit for archiving:", fetchError);
        toast.error(`Erreur lors de la récupération du versement: ${fetchError.message}`);
        return false;
      }
      
      if (!depositData) {
        console.error("Deposit not found");
        toast.error("Versement introuvable");
        return false;
      }
      
      console.log("Found deposit to archive:", depositData);
      
      // Archive the deposit in the deleted_deposits table
      console.log("Archiving deposit to deleted_deposits table");
      const { error: archiveError } = await supabase
        .from('deleted_deposits')
        .insert({
          original_id: depositData.id,
          amount: depositData.amount,
          client_name: depositData.client_name,
          notes: depositData.notes || '',
          operation_date: depositData.operation_date,
          status: depositData.status,
          deleted_by: userId
        });
      
      if (archiveError) {
        console.error("Error archiving deposit:", archiveError);
        toast.error(`Erreur lors de l'archivage du versement: ${archiveError.message}`);
        return false;
      }
      
      console.log("Successfully archived deposit to deleted_deposits");
      
      // Now delete the deposit record
      console.log(`Deleting deposit with ID ${depositId}`);
      const { error: deleteError } = await supabase
        .from('deposits')
        .delete()
        .eq('id', depositId);
      
      if (deleteError) {
        console.error("Error deleting deposit:", deleteError);
        toast.error(`Erreur lors de la suppression: ${deleteError.message}`);
        return false;
      }
      
      // Update the local state
      console.log("Updating local state after successful deletion");
      setDeposits(prevDeposits => {
        console.log("Current deposits before filter:", prevDeposits.length);
        const newDeposits = prevDeposits.filter(deposit => deposit.id !== depositId);
        console.log("New deposits after filter:", newDeposits.length);
        return newDeposits;
      });
      
      toast.success("Versement supprimé avec succès");
      return true;
    } catch (error) {
      console.error("Error during deleteDeposit function:", error);
      toast.error("Erreur lors de la suppression du versement", {
        description: error instanceof Error ? error.message : "Une erreur inconnue est survenue"
      });
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
      // Make sure we're working with a valid deposit ID
      const depositId = depositToDelete.id;
      console.log("Attempting to delete deposit with ID:", depositId, "type:", typeof depositId);
      
      const result = await deleteDeposit(depositId);
      console.log("Delete operation completed with result:", result);
      
      if (result) {
        console.log("Successful deletion, clearing state and closing dialog");
        // Clear the depositToDelete state and close the dialog after a successful deletion
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
      toast.error("Erreur lors de la suppression du versement", {
        description: error instanceof Error ? error.message : "Une erreur inconnue est survenue"
      });
      return false;
    }
  };

  return { deleteDeposit, confirmDeleteDeposit };
};
