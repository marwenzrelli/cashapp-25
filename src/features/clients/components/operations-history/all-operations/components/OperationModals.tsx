
import React from "react";
import { Operation } from "@/features/operations/types";
import { OperationDetailsModal } from "@/features/operations/components/OperationDetailsModal";
import { DeleteOperationDialog } from "@/features/operations/components/DeleteOperationDialog";
import { TransferOperationDialog } from "@/features/operations/components/TransferOperationDialog";

interface OperationModalsProps {
  isPublicView: boolean;
  selectedOperation: Operation | null;
  isDetailsModalOpen: boolean;
  isDeleteDialogOpen: boolean;
  isTransferDialogOpen: boolean;
  isDeleting: boolean;
  onDetailsModalClose: () => void;
  onDeleteDialogClose: () => void;
  onTransferDialogClose: () => void;
  onOperationUpdate: (operation: Operation) => Promise<void>;
  onDeleteClick: (operation: Operation) => void;
  onDeleteOperation: () => Promise<boolean>;
  onTransferComplete: () => Promise<void>;
}

export const OperationModals = ({
  isPublicView,
  selectedOperation,
  isDetailsModalOpen,
  isDeleteDialogOpen,
  isTransferDialogOpen,
  isDeleting,
  onDetailsModalClose,
  onDeleteDialogClose,
  onTransferDialogClose,
  onOperationUpdate,
  onDeleteClick,
  onDeleteOperation,
  onTransferComplete
}: OperationModalsProps) => {
  return (
    <>
      {/* Operation Details Modal - Always rendered */}
      <OperationDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={onDetailsModalClose}
        operation={selectedOperation}
        onEdit={onOperationUpdate}
        onDelete={onDeleteClick}
      />

      {!isPublicView && (
        <>
          <DeleteOperationDialog 
            isOpen={isDeleteDialogOpen}
            onClose={onDeleteDialogClose}
            onDelete={onDeleteOperation}
            operation={selectedOperation}
            isLoading={isDeleting}
          />

          <TransferOperationDialog
            isOpen={isTransferDialogOpen}
            onClose={onTransferDialogClose}
            operation={selectedOperation}
            onTransferComplete={onTransferComplete}
          />
        </>
      )}
    </>
  );
};
