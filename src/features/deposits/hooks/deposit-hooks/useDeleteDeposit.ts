
import { Deposit } from "@/features/deposits/types";
import { useDepositDeletion } from "./useDepositDeletion";

export const useDeleteDeposit = (
  deposits: Deposit[],
  setDeposits: React.Dispatch<React.SetStateAction<Deposit[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  depositToDelete: Deposit | null,
  setDepositToDelete: React.Dispatch<React.SetStateAction<Deposit | null>>,
  setShowDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { deleteDepositDirectly } = useDepositDeletion();

  const deleteDeposit = async (depositId: number): Promise<boolean> => {
    console.log(`[DELETE] Direct deletion called for ID: ${depositId}`);
    
    const deposit = deposits.find(d => Number(d.id) === depositId);
    if (!deposit) {
      console.error("[DELETE] Deposit not found in local state");
      return false;
    }

    return await deleteDepositDirectly(deposit);
  };

  const confirmDeleteDeposit = async (): Promise<boolean> => {
    console.log("[CONFIRM] Starting simplified confirmation process");
    
    if (!depositToDelete) {
      console.error("[CONFIRM] No deposit selected");
      return false;
    }
    
    try {
      setIsLoading(true);
      console.log(`[CONFIRM] Calling direct deletion for:`, depositToDelete);
      
      const success = await deleteDepositDirectly(depositToDelete);
      
      if (success) {
        console.log("[CONFIRM] Deletion successful, updating local state");
        
        // Update local state
        setDeposits(prevDeposits => {
          const depositId = Number(depositToDelete.id);
          const filtered = prevDeposits.filter(deposit => Number(deposit.id) !== depositId);
          console.log(`[CONFIRM] Updated local state: ${prevDeposits.length} -> ${filtered.length}`);
          return filtered;
        });
        
        // Clean up
        setDepositToDelete(null);
        setShowDeleteDialog(false);
        return true;
      } else {
        console.error("[CONFIRM] Deletion failed");
        return false;
      }
    } catch (error) {
      console.error("[CONFIRM] Error in confirmDeleteDeposit:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteDeposit, confirmDeleteDeposit };
};
