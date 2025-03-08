
import { Client } from "@/features/clients/types";
import { Deposit, EditFormData } from "@/features/deposits/types";
import { DeleteDepositDialog } from "@/features/deposits/components/DeleteDepositDialog";
import { EditDepositDialog } from "@/features/deposits/components/dialog/EditDepositDialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface DepositsDialogsProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  selectedDeposit: Deposit | null;
  editForm: EditFormData;
  handleEditFormChange: (field: string, value: string) => void;
  handleConfirmEdit: () => Promise<void>;
  confirmDelete: () => Promise<boolean>;
  clients: Client[];
}

export const DepositsDialogs = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  selectedDeposit,
  editForm,
  handleEditFormChange,
  handleConfirmEdit,
  confirmDelete,
  clients
}: DepositsDialogsProps) => {
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  
  // Reset processing state when dialog closes
  useEffect(() => {
    if (!isDeleteDialogOpen) {
      setIsProcessingDelete(false);
    }
  }, [isDeleteDialogOpen]);

  const handleConfirmDelete = async () => {
    console.log("DepositsDialogs: Démarrage de la confirmation de suppression");
    
    if (isProcessingDelete) {
      console.log("DepositsDialogs: Déjà en cours de traitement, ignoré");
      return false;
    }
    
    setIsProcessingDelete(true);
    
    try {
      // Appel à la fonction de suppression parente
      const success = await confirmDelete();
      console.log("DepositsDialogs: Résultat de la suppression:", success);
      
      if (success) {
        toast.success("Versement supprimé avec succès");
        // Ensure dialog closes after successful deletion
        setTimeout(() => {
          setIsDeleteDialogOpen(false);
          setIsProcessingDelete(false);
        }, 200);
      }
      
      return success;
    } catch (error) {
      console.error("DepositsDialogs: Erreur lors de la suppression", error);
      toast.error("Erreur lors de la suppression");
      return false;
    } finally {
      // We'll only reset processing state here if there was an error
      // For success case, we'll do it after ensuring dialog is closed
      if (!isProcessingDelete) {
        setIsProcessingDelete(false);
      }
    }
  };

  return (
    <>
      {/* Delete Dialog */}
      <DeleteDepositDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={(open) => {
          console.log("DeleteDepositDialog requested state change to:", open);
          setIsDeleteDialogOpen(open);
        }}
        selectedDeposit={selectedDeposit}
        onConfirm={handleConfirmDelete}
      />
      
      {/* Edit Dialog */}
      <EditDepositDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editForm={editForm}
        onEditFormChange={(field, value) => handleEditFormChange(field as string, value)}
        onConfirm={handleConfirmEdit}
        selectedDeposit={selectedDeposit}
        clients={clients}
      />
    </>
  );
};
