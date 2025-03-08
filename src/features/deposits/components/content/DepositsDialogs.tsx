
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
  return (
    <>
      {/* Delete Dialog */}
      <DeleteDepositDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedDeposit={selectedDeposit}
        onConfirm={confirmDelete}
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
