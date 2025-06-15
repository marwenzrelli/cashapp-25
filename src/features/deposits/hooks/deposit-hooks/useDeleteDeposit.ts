
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

      if (!userId) {
        console.error("No authenticated user found");
        toast.error("Vous devez être connecté pour supprimer un versement");
        return false;
      }

      // Check user role and permissions
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        // Allow supervisors based on email if profile fetch fails
        const supervisorEmails = [
          'marwen.zrelli.pro@icloud.com',
          'marwen.zrelli@gmail.com'
        ];
        
        if (!session.user.email || !supervisorEmails.includes(session.user.email.toLowerCase())) {
          toast.error("Permissions insuffisantes pour supprimer un versement");
          return false;
        }
      } else if (profile && !['supervisor', 'manager'].includes(profile.role)) {
        console.error("User role insufficient for deletion:", profile.role);
        toast.error("Seuls les superviseurs et managers peuvent supprimer des versements");
        return false;
      }

      // Use the centralized deletion utility
      const success = await handleDepositDeletion(depositId, userId);
      
      if (success) {
        console.log("Deletion successful, updating local state");
        // Update the local state by removing the deleted deposit
        setDeposits(prevDeposits => {
          const filtered = prevDeposits.filter(deposit => {
            // Handle both string and number IDs safely
            const depositIdToCompare = typeof deposit.id === 'string' ? 
              parseInt(String(deposit.id).replace(/\D/g, ''), 10) : 
              Number(deposit.id);
            return depositIdToCompare !== depositId;
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
      // Extract numeric ID with a more robust approach
      let depositId: number;
      
      // Get the ID value safely
      const idValue = depositToDelete.id;
      console.log("Raw deposit ID:", idValue, "type:", typeof idValue);
      
      // Handle different ID formats safely with proper type checking
      if (typeof idValue === 'number') {
        depositId = idValue;
      } else {
        // Convert to string safely and extract numeric part
        const stringValue = String(idValue);
        const numericPart = stringValue.replace(/\D/g, '');
        depositId = parseInt(numericPart, 10);
      }
      
      if (isNaN(depositId) || depositId <= 0) {
        console.error("Could not extract valid numeric ID from:", idValue);
        toast.error("Format d'ID invalide");
        return false;
      }
      
      console.log(`Attempting to delete deposit with extracted ID: ${depositId}`);
      
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
