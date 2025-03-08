
import { Client } from "@/features/clients/types";
import { Deposit, EditFormData } from "@/features/deposits/types"; // Use consistent type
import { DeleteDepositDialog } from "@/features/deposits/components/DeleteDepositDialog";
import { EditDepositDialog } from "@/features/deposits/components/dialog/EditDepositDialog";

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
  // Fonction de confirmation qui s'assure de fermer la boîte de dialogue après une suppression réussie
  const handleConfirmDelete = async () => {
    console.log("DepositsDialogs: Démarrage de la confirmation de suppression");
    const success = await confirmDelete();
    console.log("DepositsDialogs: Résultat de la suppression:", success);
    
    if (success) {
      console.log("DepositsDialogs: Fermeture de la boîte de dialogue après suppression réussie");
      setIsDeleteDialogOpen(false);
    }
    
    return success;
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
