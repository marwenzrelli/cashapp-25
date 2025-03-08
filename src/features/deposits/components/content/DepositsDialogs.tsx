
import { DeleteDepositDialog } from "../DeleteDepositDialog";
import { EditDepositDialog } from "../dialog/EditDepositDialog";
import { Deposit } from "@/components/deposits/types";
import { Client } from "@/features/clients/types";

interface DepositsDialogsProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  selectedDeposit: any | null;
  editForm: any;
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
      <DeleteDepositDialog 
        isOpen={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        onConfirm={confirmDelete} 
        selectedDeposit={selectedDeposit} 
      />

      <EditDepositDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editForm={editForm}
        onEditFormChange={handleEditFormChange}
        onConfirm={handleConfirmEdit}
        selectedDeposit={selectedDeposit}
        clients={clients}
      />
    </>
  );
};
