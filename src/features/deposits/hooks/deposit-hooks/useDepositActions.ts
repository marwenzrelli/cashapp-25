
import { Deposit, EditFormData } from "@/features/deposits/types";
import { toast } from "sonner";
import { showErrorToast } from "@/features/clients/hooks/utils/errorUtils";

interface UseDepositActionsProps {
  createDeposit: (deposit: Deposit) => Promise<boolean | void>;
  updateDeposit: (id: number, updates: any) => Promise<boolean | void>;
  confirmDeleteDeposit: () => Promise<boolean>;
  setDepositToDelete: (deposit: Deposit | null) => void;
  setShowDeleteDialog: (show: boolean) => void;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  setIsEditDialogOpen: (isOpen: boolean) => void;
  editForm: EditFormData;
  selectedDeposit: Deposit | null;
  setIsDeleting: (isDeleting: boolean) => void;
}

export const useDepositActions = ({
  createDeposit,
  updateDeposit,
  confirmDeleteDeposit,
  setDepositToDelete,
  setShowDeleteDialog,
  setIsDeleteDialogOpen,
  setIsEditDialogOpen,
  editForm,
  selectedDeposit,
  setIsDeleting
}: UseDepositActionsProps) => {
  
  const handleDelete = (deposit: Deposit) => {
    console.log("Demande de suppression pour le versement:", deposit);
    console.log("Deposit ID:", deposit.id, "type:", typeof deposit.id);
    
    // Ensure we store the full deposit object
    setDepositToDelete(deposit);
    
    // Log deposit data to ensure it's properly set
    console.log("Setting depositToDelete:", deposit);
    
    // First open the dialog, then show it
    setIsDeleteDialogOpen(true);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async (): Promise<boolean> => {
    console.log("confirmDelete called in useDepositActions");
    console.log("Current selectedDeposit:", selectedDeposit);
    
    if (!selectedDeposit) {
      console.error("No deposit selected for deletion");
      toast.error("Erreur", {
        description: "Aucun versement sélectionné"
      });
      return false;
    }
    
    setIsDeleting(true);
    console.log("Confirmation de suppression pour:", selectedDeposit);
    console.log("Deposit ID to delete:", selectedDeposit.id, "type:", typeof selectedDeposit.id);
    
    try {
      // Call the actual delete function and await its result
      console.log("Calling confirmDeleteDeposit function...");
      const success = await confirmDeleteDeposit();
      console.log("Delete operation result:", success);
      
      if (success === true) {
        console.log("Delete operation successful, closing dialog");
        setIsDeleteDialogOpen(false);
        toast.success("Succès", {
          description: "Le versement a été supprimé avec succès"
        });
        return true;
      } else {
        console.error("La suppression a échoué");
        toast.error("Échec de la suppression", {
          description: "Une erreur est survenue lors de la suppression du versement"
        });
        return false;
      }
    } catch (error) {
      console.error("Erreur détaillée lors de la suppression:", {
        message: error.message,
        stack: error.stack,
        error: error
      });
      
      showErrorToast("Échec de la suppression", error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmEdit = async (): Promise<boolean> => {
    if (!selectedDeposit) {
      console.error("Aucun versement sélectionné pour la modification");
      return false;
    }

    console.log("Confirmation des modifications pour:", selectedDeposit);
    console.log("Nouvelles valeurs:", editForm);

    // Ensure we always have a date value
    const dateToUse = editForm.date || new Date().toISOString().split('T')[0];
    const timeToUse = editForm.time || '00:00:00';

    const updates = {
      client_name: editForm.clientName,
      amount: Number(editForm.amount),
      notes: editForm.notes,
      date: dateToUse,
      time: timeToUse
    };

    console.log("Final updates being sent:", updates);

    try {
      // Ensure the ID is properly converted to a number
      const depositId = typeof selectedDeposit.id === 'string' 
        ? parseInt(selectedDeposit.id, 10) 
        : selectedDeposit.id;
      
      if (isNaN(depositId)) {
        console.error("Invalid deposit ID format:", selectedDeposit.id);
        toast.error("Format d'ID invalide");
        return false;
      }
      
      const result = await updateDeposit(depositId, updates);
      if (result === true) {
        setIsEditDialogOpen(false);
        toast.success("Succès", {
          description: "Le versement a été modifié avec succès."
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error during deposit update:", error);
      showErrorToast("Erreur", error);
      return false;
    }
  };

  const handleCreateDeposit = async (deposit: Deposit): Promise<boolean> => {
    try {
      const result = await createDeposit(deposit);
      if (result === true) {
        setIsDeleteDialogOpen(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating deposit:", error);
      showErrorToast("Erreur", error);
      return false;
    }
  };

  return {
    handleDelete,
    confirmDelete,
    handleConfirmEdit,
    handleCreateDeposit
  };
};
