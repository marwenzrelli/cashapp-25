
import { useAuthenticationCheck } from "@/features/admin/hooks/useAuthenticationCheck";
import { WithdrawalsPage } from "@/features/withdrawals/components/WithdrawalsPage";
import { OperationActionsDialog } from "@/features/clients/components/operations-history/OperationActionsDialog";
import { useState } from "react";
import { Operation } from "@/features/operations/types";

const Withdrawals = () => {
  useAuthenticationCheck(); // Add this to ensure we're authenticated
  
  // State for editing/deleting withdrawals
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Handler for edit/delete operations
  const handleEditOperation = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsEditDialogOpen(true);
  };

  const handleDeleteOperation = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedOperation(null);
  };
  
  return (
    <>
      <WithdrawalsPage 
        onEditWithdrawal={handleEditOperation}
        onDeleteWithdrawal={handleDeleteOperation}
      />
      
      {/* Edit Dialog */}
      <OperationActionsDialog
        operation={selectedOperation}
        isOpen={isEditDialogOpen}
        onClose={handleCloseDialog}
        refetchClient={() => {
          // Refresh withdrawals list when an operation is completed
          window.location.reload();
        }}
        mode="edit"
      />
      
      {/* Delete Dialog */}
      <OperationActionsDialog
        operation={selectedOperation}
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDialog}
        refetchClient={() => {
          // Refresh withdrawals list when an operation is completed
          window.location.reload();
        }}
        mode="delete"
      />
    </>
  );
};

export default Withdrawals;
