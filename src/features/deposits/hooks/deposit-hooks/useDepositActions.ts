
import { Deposit, EditFormData } from "@/components/deposits/types";
import { toast } from "sonner";

interface UseDepositActionsProps {
  createDeposit: (deposit: Deposit) => Promise<boolean>;
  updateDeposit: (id: number, updates: any) => Promise<boolean>;
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
    setDepositToDelete(deposit);
    setIsDeleteDialogOpen(true);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async (): Promise<boolean> => {
    if (!selectedDeposit) {
      toast.error("Aucun versement sélectionné");
      return false;
    }
    
    setIsDeleting(true);
    console.log("Confirmation de suppression pour:", selectedDeposit);
    
    try {
      const success = await confirmDeleteDeposit();
      
      if (success) {
        setIsDeleteDialogOpen(false);
        toast.success("Versement supprimé avec succès", {
          description: `Le versement de ${selectedDeposit.amount} TND a été supprimé.`
        });
        return true;
      } else {
        console.error("La suppression a échoué mais sans erreur lancée");
        toast.error("Échec de la suppression du versement", {
          description: "La suppression n'a pas pu être effectuée. Veuillez réessayer."
        });
        return false;
      }
    } catch (error: any) {
      console.error("Erreur détaillée lors de la suppression:", {
        message: error.message,
        stack: error.stack,
        error: error
      });
      
      toast.error("Échec de la suppression du versement", {
        description: error.message || "Une erreur est survenue lors de la suppression"
      });
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

    const success = await updateDeposit(selectedDeposit.id, updates);
    if (success) {
      setIsEditDialogOpen(false);
      toast.success("Versement mis à jour", {
        description: `Le versement a été modifié avec succès.`
      });
      return true;
    }
    return false;
  };

  const handleCreateDeposit = async (deposit: Deposit): Promise<boolean> => {
    const success = await createDeposit(deposit);
    if (success) {
      setIsDeleteDialogOpen(false);
    }
    return success;
  };

  return {
    handleDelete,
    confirmDelete,
    handleConfirmEdit,
    handleCreateDeposit
  };
};
