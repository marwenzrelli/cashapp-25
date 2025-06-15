
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
    console.log("Initiation suppression versement ID:", deposit.id);

    // Normaliser l'ID pour être sûr qu'il soit un number
    const normalizedDeposit = {
      ...deposit,
      id: typeof deposit.id === 'string' ? parseInt(deposit.id, 10) : deposit.id
    };

    // Validation de l'ID
    if (isNaN(normalizedDeposit.id) || normalizedDeposit.id <= 0) {
      console.error("ID de versement invalide:", deposit.id);
      toast.error("Erreur", {
        description: "ID de versement invalide"
      });
      return;
    }
    
    // Définir le versement à supprimer
    setDepositToDelete(normalizedDeposit);
    setIsDeleteDialogOpen(true);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async (): Promise<boolean> => {
    console.log("Confirmation suppression");
    
    // Priorité absolue à depositToDelete
    const targetDeposit = depositToDelete;

    if (!targetDeposit) {
      console.error("Aucun versement sélectionné pour suppression");
      toast.error("Erreur", {
        description: "Aucun versement sélectionné pour suppression"
      });
      return false;
    }

    // Validation finale de l'ID
    if (!targetDeposit.id || isNaN(Number(targetDeposit.id)) || Number(targetDeposit.id) <= 0) {
      console.error("ID invalide pour suppression:", targetDeposit.id);
      toast.error("Erreur", {
        description: "ID de versement invalide"
      });
      return false;
    }

    setIsDeleting(true);

    try {
      const success = await confirmDeleteDeposit();

      if (success === true) {
        console.log("Suppression réussie");
        
        // Fermer les dialogs
        setIsDeleteDialogOpen(false);
        setShowDeleteDialog(false);
        
        // Nettoyer les états
        setDepositToDelete(null);
        if (setSelectedDeposit) {
          setSelectedDeposit(null);
        }
        
        toast.success("Succès", {
          description: "Le versement a été supprimé avec succès"
        });
        
        return true;
      } else {
        console.error("Échec de la suppression");
        toast.error("Échec de la suppression", {
          description: "Une erreur est survenue lors de la suppression"
        });
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

    console.log("Confirmation des modifications pour:", selectedDeposit);
    console.log("Nouvelles valeurs:", editForm);

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
