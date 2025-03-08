
import { Client } from "@/features/clients/types";
import { Deposit, EditFormData } from "@/features/deposits/types"; // Use consistent type
import { DeleteDepositDialog } from "@/features/deposits/components/DeleteDepositDialog";
import { EditDepositDialog } from "@/features/deposits/components/dialog/EditDepositDialog";
import { useState } from "react";

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

  // Fonction de confirmation qui délègue à la fonction de suppression parente
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
      return success;
    } catch (error) {
      console.error("DepositsDialogs: Erreur lors de la suppression", error);
      return false;
    } finally {
      setIsProcessingDelete(false);
    }
  };

  return (
    <>
      {/* Delete Dialog */}
      <DeleteDepositDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
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
