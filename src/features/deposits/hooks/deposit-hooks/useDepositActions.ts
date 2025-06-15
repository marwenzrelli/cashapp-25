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
  setSelectedDeposit?: (deposit: Deposit | null) => void;
  depositToDelete?: Deposit | null;
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
  setIsDeleting,
  setSelectedDeposit,
  depositToDelete
}: UseDepositActionsProps) => {
  
  const handleDelete = (deposit: Deposit) => {
    // Normaliser l'ID pour être sûr qu'il soit un number
    const normalizedDeposit = {
      ...deposit,
      id: typeof deposit.id === 'string' ? parseInt(deposit.id, 10) : deposit.id
    };

    // Validation de l'ID
    if (isNaN(normalizedDeposit.id) || normalizedDeposit.id <= 0) {
      toast.error("ID de versement invalide");
      return;
    }
    
    // Définir le versement à supprimer
    setDepositToDelete(normalizedDeposit);
    setIsDeleteDialogOpen(true);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async (): Promise<boolean> => {
    // Priorité absolue à depositToDelete
    const targetDeposit = depositToDelete;

    if (!targetDeposit) {
      toast.error("Aucun versement sélectionné pour suppression");
      return false;
    }

    // Validation finale de l'ID
    if (!targetDeposit.id || isNaN(Number(targetDeposit.id)) || Number(targetDeposit.id) <= 0) {
      toast.error("ID de versement invalide");
      return false;
    }

    setIsDeleting(true);

    try {
      const success = await confirmDeleteDeposit();

      if (success) {
        // Fermer les dialogs
        setIsDeleteDialogOpen(false);
        setShowDeleteDialog(false);
        
        // Nettoyer les états
        setDepositToDelete(null);
        if (setSelectedDeposit) {
          setSelectedDeposit(null);
        }
        
        return true;
      } else {
        toast.error("Échec de la suppression");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
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

    const dateToUse = editForm.date || new Date().toISOString().split('T')[0];
    const timeToUse = editForm.time || '00:00:00';

    const updates = {
      client_name: editForm.clientName,
      amount: Number(editForm.amount),
      notes: editForm.notes,
      date: dateToUse,
      time: timeToUse
    };

    try {
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
        toast.success("Le versement a été modifié avec succès.");
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
