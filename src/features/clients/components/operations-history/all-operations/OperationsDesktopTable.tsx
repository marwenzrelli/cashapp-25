
import React from "react";
import { Operation } from "@/features/operations/types";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { TotalsSection } from "./TotalsSection";
import { OperationsTable } from "./components/OperationsTable";
import { OperationModals } from "./components/OperationModals";
import { useOperationHandlers } from "./hooks/useOperationHandlers";

interface OperationsDesktopTableProps {
  operations: Operation[];
  currency?: string;
  isPublicView?: boolean;
  updateOperation?: (operation: Operation) => Promise<void>;
  onOperationDeleted?: () => Promise<void>;
}

export const OperationsDesktopTable = ({
  operations,
  currency = "TND",
  isPublicView = false,
  updateOperation,
  onOperationDeleted
}: OperationsDesktopTableProps) => {
  const { refreshOperations } = useOperations();
  
  const {
    selectedOperation,
    isDetailsModalOpen,
    isDeleteDialogOpen,
    isTransferDialogOpen,
    isDeleting,
    setIsDetailsModalOpen,
    setIsDeleteDialogOpen,
    setIsTransferDialogOpen,
    handleIdClick,
    handleEditClick,
    handleDeleteClick,
    handleTransferClick,
    handleOperationUpdate,
    performDeleteOperation,
    handleTransferComplete
  } = useOperationHandlers({
    updateOperation,
    onOperationDeleted
  });

  return (
    <div>
      <OperationsTable
        operations={operations}
        currency={currency}
        isPublicView={isPublicView}
        onIdClick={handleIdClick}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onTransfer={handleTransferClick}
      />

      <div className="mt-4">
        <TotalsSection operations={operations} currency={currency} />
      </div>

      <OperationModals
        isPublicView={isPublicView}
        selectedOperation={selectedOperation}
        isDetailsModalOpen={isDetailsModalOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        isTransferDialogOpen={isTransferDialogOpen}
        isDeleting={isDeleting}
        onDetailsModalClose={() => setIsDetailsModalOpen(false)}
        onDeleteDialogClose={() => setIsDeleteDialogOpen(false)}
        onTransferDialogClose={() => setIsTransferDialogOpen(false)}
        onOperationUpdate={handleOperationUpdate}
        onDeleteClick={handleDeleteClick}
        onDeleteOperation={performDeleteOperation}
        onTransferComplete={handleTransferComplete}
      />
    </div>
  );
};
